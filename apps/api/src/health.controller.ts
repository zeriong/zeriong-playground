import { Controller, Get } from "@nestjs/common";
import type { HealthResponse } from "@repo/types";

@Controller("health")
export class HealthController {
  @Get()
  health(): HealthResponse {
    return {
      status: "ok",
      service: "api",
      timestamp: new Date().toISOString(),
    };
  }
}
