import { logger } from './logger.server';

export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Wraps a service operation with standard error handling and logging
 */
export async function withServiceHandler<T>(
  serviceName: string,
  operationName: string,
  context: Record<string, any>,
  operation: () => Promise<T>
): Promise<ServiceResult<T>> {
  const timer = logger.startTimer();
  
  try {
    const result = await operation();
    const duration = timer();
    
    logger.info(`${operationName} completed`, {
      service: serviceName,
      operation: operationName,
      duration,
      ...context
    });
    
    return {
      success: true,
      data: result
    };
  } catch (error) {
    const duration = timer();
    
    logger.error(`Failed to ${operationName}`, error, {
      service: serviceName,
      operation: operationName,
      duration,
      ...context
    });
    
    return {
      success: false,
      error: error instanceof Error ? error.message : `Failed to ${operationName}`,
      data: undefined
    };
  }
}

/**
 * Wraps array-returning operations with default empty array
 */
export async function withArrayServiceHandler<T>(
  serviceName: string,
  operationName: string,
  context: Record<string, any>,
  operation: () => Promise<T[]>
): Promise<ServiceResult<T[]>> {
  const result = await withServiceHandler(
    serviceName,
    operationName,
    context,
    operation
  );
  
  // Ensure data is always an array for array operations
  if (!result.success && !result.data) {
    result.data = [];
  }
  
  return result as ServiceResult<T[]>;
}