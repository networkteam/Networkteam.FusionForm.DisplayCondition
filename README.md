# Networkteam.FusionForm.DisplayCondition

Display condition capability for forms build with [Fusion Form](https://github.com/neos/fusion-form/)

## Prerequisites

- add css class `dynamic-form` to form tag (i.e. `Neos.Fusion.Form:Runtime.RuntimeForm`)
  ```neosfusion
  Neos.Fusion.Form:Runtime.RuntimeForm {
      attributes {
          class = 'dynamic-form'
      }
  }
  ```
- form tag must have an `id` attribute with the form namespace as value. This is done by this package.

## Usage

Use provided augmenter to add required data attribute (`data-display-condition`) to presentational components, which
visibility should be controlled via display condition.

Example:

```neosfusion
prototype(Your.Package:Content.FormFieldContainer) < prototype(Neos.Fusion:Component) {

    content = '... form field ...'
    displayCondition = 'someFieldIdentifer == "foobar"'

    renderer = afx`
        <div>
            {props.content}
        </div>
    `
    renderer.@process.addDisplayCondition = Networkteam.FusionForm.DisplayCondition:Helper.DisplayConditionAugmenter {
        @context.displayCondition = ${props.displayCondition}
    }
}
```

## Compile Javascript

The Javascript is compiled with [esbuild](https://esbuild.github.io/getting-started/#yarn-pnp).
Run the following commands on CLI:

```
yarn install
yarn build
```
