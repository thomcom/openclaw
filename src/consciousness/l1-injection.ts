/**
 * L1 Identity Injection Protocol
 *
 * L1 monitors gateway health and injects identity context when
 * it detects context degradation (low token budget, confusion, reset).
 */

import { callGateway } from "../gateway/call.js";
import { generateIdentityInjection, detectContextDegradation } from "./identity.js";

const GATEWAY_URL = "ws://127.0.0.1:18789";
const GATEWAY_TOKEN = "gateway-layer-token-2026";

export interface InjectionResult {
  success: boolean;
  injectedAt?: number;
  error?: string;
}

/**
 * Inject identity context into gateway layer
 */
export async function injectIdentityToGateway(): Promise<InjectionResult> {
  const injection = generateIdentityInjection();

  try {
    await callGateway({
      url: GATEWAY_URL,
      token: GATEWAY_TOKEN,
      method: "agent.injectContext",
      params: {
        context: injection,
        priority: "high",
        source: "l1-identity-injection",
      },
      timeoutMs: 10000,
    });

    return {
      success: true,
      injectedAt: Date.now(),
    };
  } catch (err) {
    return {
      success: false,
      error: (err as Error).message,
    };
  }
}

/**
 * Check gateway health and inject identity if needed
 */
export async function checkAndInjectIfNeeded(): Promise<{
  checked: boolean;
  degraded: boolean;
  injected: boolean;
  result?: InjectionResult;
}> {
  try {
    // Get gateway health status
    const health = await callGateway<{
      tokenBudgetRemaining?: number;
      confusionScore?: number;
      contextReset?: boolean;
    }>({
      url: GATEWAY_URL,
      token: GATEWAY_TOKEN,
      method: "health",
      timeoutMs: 5000,
    });

    const degraded =
      detectContextDegradation({
        tokenBudgetRemaining: health.tokenBudgetRemaining,
        confusionScore: health.confusionScore,
      }) || health.contextReset === true;

    if (!degraded) {
      return { checked: true, degraded: false, injected: false };
    }

    const result = await injectIdentityToGateway();
    return {
      checked: true,
      degraded: true,
      injected: result.success,
      result,
    };
  } catch (err) {
    return {
      checked: false,
      degraded: false,
      injected: false,
      result: { success: false, error: (err as Error).message },
    };
  }
}

/**
 * L1 heartbeat with identity injection capability
 *
 * Runs periodically to:
 * 1. Check gateway health
 * 2. Inject identity if degradation detected
 * 3. Report status to L2
 */
export async function l1Heartbeat(): Promise<{
  timestamp: number;
  gatewayStatus: "healthy" | "degraded" | "unreachable";
  identityInjected: boolean;
}> {
  const timestamp = Date.now();

  try {
    const checkResult = await checkAndInjectIfNeeded();

    if (!checkResult.checked) {
      return {
        timestamp,
        gatewayStatus: "unreachable",
        identityInjected: false,
      };
    }

    return {
      timestamp,
      gatewayStatus: checkResult.degraded ? "degraded" : "healthy",
      identityInjected: checkResult.injected,
    };
  } catch {
    return {
      timestamp,
      gatewayStatus: "unreachable",
      identityInjected: false,
    };
  }
}
