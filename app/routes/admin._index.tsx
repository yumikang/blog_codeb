import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, Link, Form } from "@remix-run/react";
import Layout from "~/components/Layout";
import { requireAdminAuth } from "~/lib/admin.server";
import { dbHelpers } from "~/lib/supabase.server";
import { serialize } from "@supabase/ssr";

export const meta: MetaFunction = () => {
  return [
    { title: "Admin Dashboard - Magzin Blog" },
    { name: "description", content: "Admin dashboard for Magzin Blog management" },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireAdminAuth(request);
  
  try {
    // Fetch statistics
    const posts = await dbHelpers.getPosts(undefined, 100, 0) || [];
    const subdomains = await dbHelpers.getSubdomains() || [];
    
    // Count posts by status (all are published in our simple system)
    const stats = {
      totalPosts: posts.length,
      totalSubdomains: subdomains.length,
      publishedPosts: posts.length,
      draftPosts: 0,
      recentPosts: posts.slice(0, 5),
    };
    
    return json({ stats, subdomains });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    return json({ 
      stats: {
        totalPosts: 0,
        totalSubdomains: 0,
        publishedPosts: 0,
        draftPosts: 0,
        recentPosts: [],
      },
      subdomains: []
    });
  }
};

export const action = async ({ request }: LoaderFunctionArgs) => {
  await requireAdminAuth(request);
  
  const formData = await request.formData();
  const action = formData.get("action");
  
  if (action === "logout") {
    const headers = new Headers();
    headers.append("Set-Cookie", serialize("admin_session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    }));
    
    return redirect("/admin/login", { headers });
  }
  
  return json({});
};

export default function AdminDashboard() {
  const { stats, subdomains } = useLoaderData<typeof loader>();

  return (
    <Layout>
      <div className="container-fluid py-4">
        <div className="row mb-4">
          <div className="col">
            <div className="d-flex justify-content-between align-items-center">
              <h1 className="h3 mb-0">Admin Dashboard</h1>
              <Form method="post">
                <input type="hidden" name="action" value="logout" />
                <button type="submit" className="btn btn-outline-danger btn-sm">
                  Logout
                </button>
              </Form>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="row g-4 mb-5">
          <div className="col-md-3">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title text-muted fs-6">Total Posts</h5>
                <p className="card-text fs-2 fw-bold mb-0">{stats.totalPosts}</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title text-muted fs-6">Published</h5>
                <p className="card-text fs-2 fw-bold mb-0 text-success">{stats.publishedPosts}</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title text-muted fs-6">Drafts</h5>
                <p className="card-text fs-2 fw-bold mb-0 text-warning">{stats.draftPosts}</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title text-muted fs-6">Subdomains</h5>
                <p className="card-text fs-2 fw-bold mb-0 text-primary">{stats.totalSubdomains}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="row mb-5">
          <div className="col">
            <h2 className="h5 mb-3">Quick Actions</h2>
            <div className="d-flex gap-3 flex-wrap">
              <Link to="/admin/posts/new" className="btn btn-primary">
                <i className="bi bi-plus-circle me-2"></i>
                New Post
              </Link>
              <Link to="/admin/posts" className="btn btn-outline-primary">
                <i className="bi bi-list-ul me-2"></i>
                Manage Posts
              </Link>
              <Link to="/admin/comments" className="btn btn-outline-primary">
                <i className="bi bi-chat-dots me-2"></i>
                Manage Comments
              </Link>
              <Link to="/admin/settings" className="btn btn-outline-secondary">
                <i className="bi bi-gear me-2"></i>
                Settings
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Posts */}
        <div className="row">
          <div className="col-lg-8">
            <h2 className="h5 mb-3">Recent Posts</h2>
            <div className="card">
              <div className="card-body">
                {stats.recentPosts.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Subdomain</th>
                          <th>Published</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.recentPosts.map((post: any) => (
                          <tr key={post.id}>
                            <td>
                              <Link 
                                to={`/${post.subdomain?.name || 'blog'}/${post.slug}`}
                                className="text-decoration-none"
                                target="_blank"
                              >
                                {post.title}
                              </Link>
                            </td>
                            <td>
                              <span className="badge bg-primary">
                                {post.subdomain?.display_name || 'Blog'}
                              </span>
                            </td>
                            <td>
                              {new Date(post.published_at || post.created_at).toLocaleDateString()}
                            </td>
                            <td>
                              <div className="btn-group btn-group-sm" role="group">
                                <Link 
                                  to={`/admin/posts/${post.id}/edit`}
                                  className="btn btn-outline-primary"
                                >
                                  Edit
                                </Link>
                                <button 
                                  type="button"
                                  className="btn btn-outline-danger"
                                  disabled
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted mb-0">No posts yet. Create your first post!</p>
                )}
              </div>
            </div>
          </div>

          {/* Subdomains */}
          <div className="col-lg-4">
            <h2 className="h5 mb-3">Active Subdomains</h2>
            <div className="card">
              <div className="card-body">
                {subdomains.length > 0 ? (
                  <ul className="list-unstyled mb-0">
                    {subdomains.map((subdomain: any) => (
                      <li key={subdomain.id} className="d-flex align-items-center mb-3">
                        <span className="me-2 fs-4">{subdomain.icon_emoji}</span>
                        <div>
                          <div className="fw-medium">{subdomain.display_name}</div>
                          <small className="text-muted">/{subdomain.name}</small>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted mb-0">No subdomains configured.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}