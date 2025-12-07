/**
 * Action Registry
 * Centralized action handlers for extensibility
 */

import { NavigateActionArgs } from "./validators";
import { VALID_PATHS } from "./constants";

export interface ActionContext {
  router: {
    push: (path: string) => void;
  };
}

export interface ActionHandler {
  execute: (args: any, context: ActionContext) => void | Promise<void>;
  validate?: (args: any) => boolean;
}

/**
 * Navigate Action Handler
 */
const navigateAction: ActionHandler = {
  execute: (args: NavigateActionArgs, context: ActionContext) => {
    const { path, filter } = args;

    // Validate path
    if (!VALID_PATHS.includes(path as any)) {
      throw new Error(
        `Invalid path: ${path}. Valid paths are: ${VALID_PATHS.join(", ")}`
      );
    }

    // Build destination with optional filter
    const destination = filter
      ? `${path}?filter=${encodeURIComponent(filter)}`
      : path;
    context.router.push(destination);
  },
  validate: (args: NavigateActionArgs) => {
    return VALID_PATHS.includes(args.path as any);
  },
};

/**
 * Action Registry
 * Add new actions here for extensibility
 */
export const actionHandlers: Record<string, ActionHandler> = {
  navigate: navigateAction,
  // Future actions can be added here:
  // search: searchAction,
  // filter: filterAction,
  // etc.
};

/**
 * Execute an action by name
 */
export function executeAction(
  actionName: string,
  args: any,
  context: ActionContext
): void | Promise<void> {
  const handler = actionHandlers[actionName];

  if (!handler) {
    throw new Error(
      `Unknown action: ${actionName}. Available actions: ${Object.keys(
        actionHandlers
      ).join(", ")}`
    );
  }

  // Validate if validator exists
  if (handler.validate && !handler.validate(args)) {
    throw new Error(`Invalid arguments for action: ${actionName}`);
  }

  return handler.execute(args, context);
}
