import test from "node:test";
import assert from "node:assert/strict";
import { scanText } from "../services/local-scanner.js";

test("scanner detects email addresses with explanation", () => {
  const signals = scanText("Contact alice@example.com before release.");
  const emailSignal = signals.find((signal) => signal.ruleId === "email-address");

  assert.ok(emailSignal);
  assert.equal(emailSignal.severity, "LOW");
  assert.equal(emailSignal.matchPreview, "alice@example.com");
});

test("scanner marks passport references as high severity", () => {
  const signals = scanText("Passport copy attached for review.");
  const passportSignal = signals.find((signal) => signal.ruleId === "passport-reference");

  assert.ok(passportSignal);
  assert.equal(passportSignal.severity, "HIGH");
});
