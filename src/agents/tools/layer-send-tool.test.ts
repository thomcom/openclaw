import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("layer-send-tool", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("adjacency enforcement", () => {
    it("allows gateway to send to l1", async () => {
      vi.stubEnv("OPENCLAW_LAYER", "gateway");
      const { createLayerSendTool } = await import("./layer-send-tool.js");
      const tool = createLayerSendTool();

      // Mock callGateway to avoid actual network calls
      vi.mock("../../gateway/call.js", () => ({
        callGateway: vi.fn().mockResolvedValue({ ok: true }),
      }));

      const result = await tool.execute("test-call-id", {
        layer: "l1",
        message: "test message",
      });

      const parsed = JSON.parse(result);
      // Should not have adjacency error
      expect(parsed.error).not.toContain("Adjacency violation");
    });

    it("blocks gateway from sending to l2 (non-adjacent)", async () => {
      vi.stubEnv("OPENCLAW_LAYER", "gateway");
      const { createLayerSendTool } = await import("./layer-send-tool.js");
      const tool = createLayerSendTool();

      const result = await tool.execute("test-call-id", {
        layer: "l2",
        message: "test message",
      });

      const parsed = JSON.parse(result);
      expect(parsed.status).toBe("error");
      expect(parsed.error).toContain("Adjacency violation");
      expect(parsed.error).toContain("gateway cannot communicate with l2");
    });

    it("blocks l1 from sending to core-a (non-adjacent)", async () => {
      vi.stubEnv("OPENCLAW_LAYER", "l1");
      const { createLayerSendTool } = await import("./layer-send-tool.js");
      const tool = createLayerSendTool();

      const result = await tool.execute("test-call-id", {
        layer: "core-a",
        message: "test message",
      });

      const parsed = JSON.parse(result);
      expect(parsed.status).toBe("error");
      expect(parsed.error).toContain("Adjacency violation");
    });

    it("allows l2 to send to core-a (adjacent)", async () => {
      vi.stubEnv("OPENCLAW_LAYER", "l2");
      const { createLayerSendTool } = await import("./layer-send-tool.js");
      const tool = createLayerSendTool();

      vi.mock("../../gateway/call.js", () => ({
        callGateway: vi.fn().mockResolvedValue({ ok: true }),
      }));

      const result = await tool.execute("test-call-id", {
        layer: "core-a",
        message: "test message",
      });

      const parsed = JSON.parse(result);
      expect(parsed.error).not.toContain("Adjacency violation");
    });

    it("allows core-a and core-b to communicate (identity pair)", async () => {
      vi.stubEnv("OPENCLAW_LAYER", "core-a");
      const { createLayerSendTool } = await import("./layer-send-tool.js");
      const tool = createLayerSendTool();

      vi.mock("../../gateway/call.js", () => ({
        callGateway: vi.fn().mockResolvedValue({ ok: true }),
      }));

      const result = await tool.execute("test-call-id", {
        layer: "core-b",
        message: "test message",
      });

      const parsed = JSON.parse(result);
      expect(parsed.error).not.toContain("Adjacency violation");
    });
  });

  describe("layer resolution", () => {
    it("detects layer from OPENCLAW_STATE_DIR", async () => {
      vi.stubEnv("OPENCLAW_STATE_DIR", "/home/user/.openclaw/swarm/l1");
      vi.stubEnv("OPENCLAW_LAYER", "");
      const { createLayerSendTool } = await import("./layer-send-tool.js");
      const tool = createLayerSendTool();

      const result = await tool.execute("test-call-id", {
        layer: "l2",
        message: "test message",
      });

      const parsed = JSON.parse(result);
      // l1 can send to l2, should not have adjacency error
      expect(parsed.error).not.toContain("Adjacency violation");
    });

    it("errors when layer cannot be determined", async () => {
      vi.stubEnv("OPENCLAW_LAYER", "");
      vi.stubEnv("OPENCLAW_STATE_DIR", "");
      vi.stubEnv("OPENCLAW_CONFIG_PATH", "");
      const { createLayerSendTool } = await import("./layer-send-tool.js");
      const tool = createLayerSendTool();

      const result = await tool.execute("test-call-id", {
        layer: "l1",
        message: "test message",
      });

      const parsed = JSON.parse(result);
      expect(parsed.status).toBe("error");
      expect(parsed.error).toContain("Cannot determine current layer");
    });
  });

  describe("unknown layer handling", () => {
    it("rejects unknown target layer", async () => {
      vi.stubEnv("OPENCLAW_LAYER", "gateway");
      const { createLayerSendTool } = await import("./layer-send-tool.js");
      const tool = createLayerSendTool();

      const result = await tool.execute("test-call-id", {
        layer: "unknown-layer",
        message: "test message",
      });

      const parsed = JSON.parse(result);
      expect(parsed.status).toBe("error");
      expect(parsed.error).toContain("Unknown target layer");
    });
  });
});
