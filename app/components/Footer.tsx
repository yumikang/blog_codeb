import { Link } from "@remix-run/react";
import { FooterProps } from "~/types/layout";

export default function Footer({ className = "" }: FooterProps) {
  return (
    <>
      {/* Footer */}
      <footer className={className}>
        <div className="section-footer sec-padding overflow-hidden">
          <div className="container">
            <div className="row">
              <div className="col-12 text-center">
                <Link to="/">
                  <img src="/imgs/template/logo/logo-big.png" alt="magzin" />
                </Link>
                <p className="text-dark mb-5 mt-2">Your Gateway to Global News</p>
                <div className="d-flex flex-wrap justify-content-center align-items-center gap-lg-5 gap-md-4">
                  <button type="button" className="text-600 hover-dark d-block px-2 button-effect-1 btn btn-link border-0">
                    Privacy Policy
                  </button>
                  <button type="button" className="text-600 hover-dark d-block px-2 button-effect-1 btn btn-link border-0">
                    Term of Use
                  </button>
                  <button type="button" className="text-600 hover-dark d-block px-2 button-effect-1 btn btn-link border-0">
                    Careers
                  </button>
                  <button type="button" className="text-600 hover-dark d-block px-2 button-effect-1 btn btn-link border-0">
                    Help
                  </button>
                  <button type="button" className="text-600 hover-dark d-block px-2 button-effect-1 btn btn-link border-0">
                    Become author
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      <div className="btn-scroll-top">
        <svg className="progress-square svg-content" width="100%" height="100%" viewBox="0 0 40 40">
          <path d="M20 1a19 19 0 1 1 0 38 19 19 0 0 1 0-38" />
        </svg>
      </div>
    </>
  );
}