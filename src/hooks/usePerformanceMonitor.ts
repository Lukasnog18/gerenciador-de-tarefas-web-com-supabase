
import { useCallback, useRef } from 'react';

interface PerformanceMetric {
  operation: string;
  entity: string;
  duration: number;
  timestamp: number;
  success: boolean;
}

interface PerformanceStats {
  count: number;
  total: number;
  avg: number;
  min: number;
  max: number;
}

export const usePerformanceMonitor = () => {
  const metricsRef = useRef<PerformanceMetric[]>([]);

  const measureOperation = useCallback(async <T>(
    entity: string,
    operation: string,
    operationFn: () => Promise<T>
  ): Promise<T> => {
    const startTime = performance.now();
    let success = true;
    let result: T;

    try {
      result = await operationFn();
    } catch (error) {
      success = false;
      throw error;
    } finally {
      const endTime = performance.now();
      const duration = endTime - startTime;

      const metric: PerformanceMetric = {
        operation,
        entity,
        duration,
        timestamp: Date.now(),
        success
      };

      metricsRef.current.push(metric);

      // Log colorido no console
      const color = getOperationColor(operation);
      const status = success ? '✅' : '❌';
      console.log(
        `%c[${entity.toUpperCase()}] ${operation.toUpperCase()}: ${duration.toFixed(2)}ms ${status}`,
        `color: ${color}; font-weight: bold;`
      );
    }

    return result!;
  }, []);

  const getStats = useCallback((entity?: string, operation?: string): Record<string, PerformanceStats> => {
    const filteredMetrics = metricsRef.current.filter(metric => {
      if (entity && metric.entity !== entity) return false;
      if (operation && metric.operation !== operation) return false;
      return metric.success;
    });

    const groupedMetrics = filteredMetrics.reduce((acc, metric) => {
      const key = `${metric.entity}_${metric.operation}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(metric.duration);
      return acc;
    }, {} as Record<string, number[]>);

    const stats: Record<string, PerformanceStats> = {};
    
    Object.entries(groupedMetrics).forEach(([key, durations]) => {
      const total = durations.reduce((sum, d) => sum + d, 0);
      stats[key] = {
        count: durations.length,
        total,
        avg: total / durations.length,
        min: Math.min(...durations),
        max: Math.max(...durations)
      };
    });

    return stats;
  }, []);

  const generateReport = useCallback(() => {
    const stats = getStats();
    const entities = ['projects', 'tasks', 'tags', 'comments'];
    const operations = ['create', 'read', 'update', 'delete'];

    console.log('%c=== RELATÓRIO DE PERFORMANCE ===', 'color: #2563eb; font-size: 16px; font-weight: bold;');
    
    entities.forEach(entity => {
      const entityStats = Object.entries(stats).filter(([key]) => key.startsWith(entity));
      if (entityStats.length === 0) return;

      console.log(`%c${entity.toUpperCase()}:`, 'color: #1f2937; font-size: 14px; font-weight: bold;');
      
      operations.forEach(operation => {
        const key = `${entity}_${operation}`;
        const stat = stats[key];
        if (stat) {
          console.log(
            `  ${operation.toUpperCase()}: média ${stat.avg.toFixed(2)}ms (min: ${stat.min.toFixed(2)}ms, max: ${stat.max.toFixed(2)}ms, ${stat.count} ops)`
          );
        }
      });
      console.log('');
    });
  }, [getStats]);

  const clearMetrics = useCallback(() => {
    metricsRef.current = [];
    console.log('%cMétricas de performance limhas', 'color: #6b7280; font-style: italic;');
  }, []);

  return {
    measureOperation,
    getStats,
    generateReport,
    clearMetrics
  };
};

const getOperationColor = (operation: string): string => {
  switch (operation.toLowerCase()) {
    case 'create': return '#10b981'; // verde
    case 'read': return '#3b82f6';   // azul
    case 'update': return '#f59e0b'; // amarelo
    case 'delete': return '#ef4444'; // vermelho
    default: return '#6b7280';       // cinza
  }
};
