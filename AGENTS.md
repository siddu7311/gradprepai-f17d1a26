# Architecture rules
- Reset document scroll in a single router-level layout effect, while retaining explicit section anchors; this keeps page entry consistent across layouts.
- Payment dialogs use a portalled, focus-trapped modal with a fixed header and independently scrolling body; dismissal remains reachable on short screens and above sticky navigation.
- Schedule notification delivery checks saved channel and event-category preferences before sending; opt-outs must not be bypassed by browser permissions.
- Use Bun's built-in test runner for isolated notification preference tests; these rules can be checked without a DOM or external service.
- Keep tests outside src so application-only compilation does not require runner types.
- RLS admin checks use a current-user-only helper in a non-exposed private schema; this preserves revoked public RPC privileges without breaking owner profile reads or saves.