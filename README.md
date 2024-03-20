# solid2angular

Simple library for using SolidJS components in AngularJS applications.

## Installation

```bash
npm install solid2angular
```

## Usage

```typescript jsx
import {solid2angular} from "solid2angular";

function MyComponent(props: {binding1: any}) {
  return <div>{props.binding1}</div>;
}

app.component(
  "myComponent",
  solid2angular([], ["binding1"], props => {
    return <MyComponent binding1={props.binding1}></MyComponent>;
  }),
);
```

One thing to note is that the component will be rendered only once, and the props will be updated whenever the `$onChanges` method is called.
On the other hand, dependencies are injected as values and changing them will not trigger a re-render.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the GPL-3.0 License - see the [LICENSE](LICENSE) file for details.