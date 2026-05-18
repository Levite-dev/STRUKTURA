import { StepHandlerRegistry, StepHandler } from '../../src/modules/onboarding/application/commands/save-step/step-handler.registry';

describe('StepHandlerRegistry', () => {
  let registry: StepHandlerRegistry;
  let mockHandler: StepHandler;

  beforeEach(() => {
    registry = new StepHandlerRegistry();
    mockHandler = { handle: jest.fn().mockResolvedValue(undefined) };
  });

  it('registers and retrieves a handler', () => {
    registry.register('client.address', mockHandler);
    expect(registry.get('client.address')).toBe(mockHandler);
  });

  it('returns undefined for unregistered fieldGroupCode', () => {
    expect(registry.get('nonexistent')).toBeUndefined();
  });

  it('overwrites existing registration', () => {
    const handler2: StepHandler = { handle: jest.fn() };
    registry.register('client.address', mockHandler);
    registry.register('client.address', handler2);
    expect(registry.get('client.address')).toBe(handler2);
  });
});
