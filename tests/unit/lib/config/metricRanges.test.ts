/**
 * Unit Tests - metricRanges.ts
 * VALIDACIÓN C2.1: Configuración centralizada de rangos
 */

import { describe, it, expect } from "vitest";
import {
  getSLAStatus,
  getHealthScoreStatus,
  SLA_RANGES,
  HEALTH_SCORE_RANGES,
  type MetricStatus,
} from "@/lib/config/metricRanges";

describe("metricRanges", () => {
  describe("getSLAStatus", () => {
    it("debe retornar 'excelente' para valores >= 95", () => {
      const result = getSLAStatus(95);
      expect(result.status).toBe("excelente");
      expect(result.label).toBe("Excelente");
      expect(result.color).toBe("text-green-500");
      expect(result.bgColor).toBe("bg-green-500/10");
    });

    it("debe retornar 'excelente' para valor 100", () => {
      const result = getSLAStatus(100);
      expect(result.status).toBe("excelente");
    });

    it("debe retornar 'bueno' para valores entre 85 y 94.99", () => {
      const result = getSLAStatus(90);
      expect(result.status).toBe("bueno");
      expect(result.label).toBe("Bueno");
      expect(result.color).toBe("text-blue-500");
    });

    it("debe retornar 'bueno' para valor 85", () => {
      const result = getSLAStatus(85);
      expect(result.status).toBe("bueno");
    });

    it("debe retornar 'regular' para valores entre 70 y 84.99", () => {
      const result = getSLAStatus(75);
      expect(result.status).toBe("regular");
      expect(result.label).toBe("Regular");
      expect(result.color).toBe("text-orange-500");
    });

    it("debe retornar 'regular' para valor 70", () => {
      const result = getSLAStatus(70);
      expect(result.status).toBe("regular");
    });

    it("debe retornar 'critico' para valores < 70", () => {
      const result = getSLAStatus(50);
      expect(result.status).toBe("critico");
      expect(result.label).toBe("Crítico");
      expect(result.color).toBe("text-red-500");
    });

    it("debe retornar 'critico' para valor 0", () => {
      const result = getSLAStatus(0);
      expect(result.status).toBe("critico");
    });

    it("debe retornar 'sin_datos' para null", () => {
      const result = getSLAStatus(null);
      expect(result.status).toBe("sin_datos");
      expect(result.label).toBe("Sin datos");
    });

    it("debe retornar 'sin_datos' para undefined", () => {
      const result = getSLAStatus(undefined);
      expect(result.status).toBe("sin_datos");
    });

    it("debe retornar 'sin_datos' para NaN", () => {
      const result = getSLAStatus(NaN);
      expect(result.status).toBe("sin_datos");
    });

    it("debe manejar valores fuera de rango [0, 100]", () => {
      // Valores negativos
      const resultNeg = getSLAStatus(-10);
      expect(resultNeg.status).toBe("sin_datos");
      
      // Valores > 100
      const resultHigh = getSLAStatus(150);
      expect(resultHigh.status).toBe("sin_datos");
    });
  });

  describe("getHealthScoreStatus", () => {
    it("debe retornar 'excelente' para valores >= 24", () => {
      const result = getHealthScoreStatus(25);
      expect(result.status).toBe("excelente");
      expect(result.label).toBe("Excelente");
    });

    it("debe retornar 'bueno' para valores entre 18 y 23.99", () => {
      const result = getHealthScoreStatus(20);
      expect(result.status).toBe("bueno");
      expect(result.label).toBe("Bueno");
    });

    it("debe retornar 'regular' para valores entre 12 y 17.99", () => {
      const result = getHealthScoreStatus(15);
      expect(result.status).toBe("regular");
      expect(result.label).toBe("Regular");
    });

    it("debe retornar 'critico' para valores < 12", () => {
      const result = getHealthScoreStatus(10);
      expect(result.status).toBe("critico");
      expect(result.label).toBe("Crítico");
    });

    it("debe retornar 'sin_datos' para null", () => {
      const result = getHealthScoreStatus(null);
      expect(result.status).toBe("sin_datos");
    });
  });

  describe("Rangos de configuración", () => {
    it("SLA_RANGES debe tener todos los status definidos", () => {
      const expectedStatuses: MetricStatus[] = ["excelente", "bueno", "regular", "critico", "sin_datos"];
      expectedStatuses.forEach((status) => {
        expect(SLA_RANGES[status]).toBeDefined();
        expect(SLA_RANGES[status].label).toBeDefined();
        expect(SLA_RANGES[status].color).toBeDefined();
        expect(SLA_RANGES[status].bgColor).toBeDefined();
      });
    });

    it("HEALTH_SCORE_RANGES debe tener todos los status definidos", () => {
      const expectedStatuses: MetricStatus[] = ["excelente", "bueno", "regular", "critico", "sin_datos"];
      expectedStatuses.forEach((status) => {
        expect(HEALTH_SCORE_RANGES[status]).toBeDefined();
      });
    });

    it("Rangos de SLA no deben solaparse", () => {
      const ranges = [
        { status: "excelente", min: 95, max: 100 },
        { status: "bueno", min: 85, max: 94.99 },
        { status: "regular", min: 70, max: 84.99 },
        { status: "critico", min: 0, max: 69.99 },
      ];

      // Verificar que no hay solapamiento
      for (let i = 0; i < ranges.length; i++) {
        for (let j = i + 1; j < ranges.length; j++) {
          const range1 = ranges[i];
          const range2 = ranges[j];
          
          // No deben solaparse
          expect(
            range1.max < range2.min || range2.max < range1.min
          ).toBe(true);
        }
      }
    });
  });
});
