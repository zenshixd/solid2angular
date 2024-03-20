import { createSignal, JSX, Setter } from "solid-js";
import { IAugmentedJQuery, IComponentOptions, IOnChangesObject } from "angular";
import { render } from "solid-js/web";

export type ComponentFn = (...args: any[]) => JSX.Element;

export function solid2angular(
  dependencies: string[],
  bindings: string[],
  Component: ComponentFn,
): IComponentOptions {
  return {
    bindings: toNgBindings(bindings),
    controller: [
      "$element",
      ...dependencies,
      class {
        bindingSetters: Record<string, Setter<any>> = {};
        injectedDeps: any[];
        isRendered = false;
        unrender: (() => void) | undefined;

        constructor(
          private $element: IAugmentedJQuery,
          ...injectedDeps: any[]
        ) {
          this.injectedDeps = injectedDeps;
        }

        $onChanges(changes: IOnChangesObject) {
          if (this.isRendered) {
            this.updateProps(changes);
          } else {
            this.unrender = render(
              () => Component(this.createProps(changes)),
              this.$element[0],
            );
            this.isRendered = true;
          }
        }

        $onDestroy() {
          this.isRendered = false;
          if (this.unrender) {
            this.unrender();
          }
        }

        createProps(changes: IOnChangesObject) {
          const props: Record<string, any> = dependenciesToProps(
            dependencies,
            this.injectedDeps,
          );

          for (const changedProp of Object.keys(changes)) {
            const [value, setValue] = createSignal(
              changes[changedProp].currentValue,
            );
            Object.defineProperty(props, changedProp, {
              get: () => value(),
            });
            this.bindingSetters[changedProp] = setValue;
          }

          return props;
        }

        updateProps(changes: IOnChangesObject) {
          for (const changedProp of Object.keys(changes)) {
            if (this.bindingSetters[changedProp]) {
              this.bindingSetters[changedProp](
                changes[changedProp].currentValue,
              );
            }
          }
        }
      },
    ],
  };
}

function toNgBindings(bindings: string[]) {
  return bindings.reduce(
    (acc, bindingName) => {
      acc[bindingName] = "<";
      return acc;
    },
    {} as Record<string, string>,
  );
}

function dependenciesToProps(dependencies: string[], injectedDeps: any[]) {
  return injectedDeps.reduce(
    (acc, dep, i) => {
      acc[dependencies[i]] = dep;
      return acc;
    },
    {} as Record<string, any>,
  );
}
