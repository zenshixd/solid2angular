import {
  Accessor,
  createSignal,
  JSX,
  mergeProps,
  Setter,
  Signal,
} from "solid-js";
import { IAugmentedJQuery, IComponentOptions, IOnChangesObject } from "angular";
import { render } from "solid-js/web";

export type ComponentFn = (...args: any[]) => JSX.Element;

export function solid2angular(
  dependencies: string[],
  bindings: string[],
  component: ComponentFn,
): IComponentOptions {
  return {
    bindings: bindings.reduce(
      (acc, bindingName) => {
        acc[bindingName] = "<";
        return acc;
      },
      {} as Record<string, string>,
    ),
    controller: [
      "$element",
      ...dependencies,
      class {
        bindingSetters: Record<string, Setter<any>> = {};
        injectedProps: Record<string, any>;
        isRendered = false;

        constructor(
          private $element: IAugmentedJQuery,
          ...injectedDeps: any[]
        ) {
          console.log("constructor");
          this.injectedProps = injectedDeps.reduce(
            (acc, dep, i) => {
              acc[dependencies[i]] = dep;
              return acc;
            },
            {} as Record<string, any>,
          );
        }

        $onChanges(changes: IOnChangesObject) {
          console.log("Changes", changes);
          if (this.isRendered) {
            console.log("updating");
            for (let key of Object.keys(changes)) {
              if (this.bindingSetters[key]) {
                console.log(
                  `calling set on ${key} (${changes[key].currentValue})`,
                );
                this.bindingSetters[key](changes[key].currentValue);
              }
            }
          } else {
            console.log("first");
            render(() => {
              const props: Record<string, any> = {};
              Object.keys(changes).forEach((key) => {
                const [value, setValue] = createSignal(
                  changes[key].currentValue,
                );
                props[key] = value;
                this.bindingSetters[key] = setValue;
              });

              return component(mergeProps(props, this.injectedProps));
            }, this.$element[0]);
            this.isRendered = true;
          }
        }

        $onDestroy() {
          this.isRendered = false;
          render(() => null, this.$element[0]);
        }
      },
    ],
  };
}
