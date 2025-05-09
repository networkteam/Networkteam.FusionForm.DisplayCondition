# Networkteam.FusionForm.DisplayCondition

Control the visibility of [Neos Fusion Form](https://github.com/neos/fusion-form/) elements while filling out
the form.

A display condition ensures that an element is only displayed if the configured condition is fulfilled. A subset of
JavaScript ([networkteam/eel](https://github.com/networkteam/eel)) can be used for this purpose. Form values can be
referenced using the element identifier.

## Installation

Required package via composer.

```shell
composer require networkteam/fusionform-displaycondition
```

## Prerequisites

For using display conditions within a form a few prerequisites must be met:

- The CSS class `dynamic-form` must be applied to the `<form>` tag
- The `<form>` tag must have an `id` attribute with the forms namespace as value
- Add tags to `Neos.Neos:Page` for loading stylesheet and JavaScript

This package does that already by extending `Neos.Fusion.Form:Form` and `Neos.Neos:Page`.

## Usage

### Add id to form control you want to interact with

To dynamically show or hide elements (based on entered form values) within a form, you must set an `id` for the controls
you want to interact with. The `id` is used as variable name inside display condition expression.

### Add data attribute holding display condition expression

Any component inside your form which visibility you want to control via condition must have a `data-display-condition`
attribute. The value is a [Javascript EEL expression](https://github.com/networkteam/eel).

Use the provided helper (`Networkteam.FusionForm.DisplayCondition:Helper.DisplayConditionAugmenter`) to add the required
data attribute to your components.

Example:

```neosfusion
prototype(Vendor.Site:Content.SingleStepFormExample) < prototype(Neos.Fusion.Form:Runtime.RuntimeForm) {

    // set context variable to enable usage of display conditions. When set to `false` no display condition related
    // attribute will be renderd
    @context.displayConditionEnabled = true

    namespace = "single_step_form_example"

    process {

        content = afx`
            <Neos.Fusion.Form:FieldContainer field.name="firstName" label="First Name">
                <Neos.Fusion.Form:Input />
            </Neos.Fusion.Form:FieldContainer>
            <Neos.Fusion.Form:FieldContainer field.name="lastName" label="Last Name">
                <Neos.Fusion.Form:Input />
            </Neos.Fusion.Form:FieldContainer>

<!-- show picture field only, if firstName and lastName has been filled out -->

            <Neos.Fusion.Form:FieldContainer field.name="picture" label="Picture" displayCondition="firstName && lastName">
                <Neos.Fusion.Form:Upload />
            </Neos.Fusion.Form:FieldContainer>

            <Neos.Fusion.Form:FieldContainer field.name="birthDate" label="BirthDate">
                <Neos.Fusion.Form:Date />
            </Neos.Fusion.Form:FieldContainer>
            <Neos.Fusion.Form:FieldContainer field.name="sports" field.multiple label="Sports">
                <Neos.Fusion.Form:Select>
                    <Neos.Fusion.Form:Select.Option option.value="climbing" />
                    <Neos.Fusion.Form:Select.Option option.value="biking" />
                    <Neos.Fusion.Form:Select.Option option.value="hiking" />
                    <Neos.Fusion.Form:Select.Option option.value="swimming" />
                    <Neos.Fusion.Form:Select.Option option.value="running" />
                </Neos.Fusion.Form:Select>
            </Neos.Fusion.Form:FieldContainer>
        `

        schema {
            firstName = ${Form.Schema.string().isRequired()}
            lastName = ${Form.Schema.string().isRequired().validator('StringLength', {minimum: 6, maximum: 12})}
            picture = ${Form.Schema.resource().isRequired().validator('Neos\Fusion\Form\Runtime\Validation\Validator\FileTypeValidator', {allowedExtensions:['txt', 'jpg']})}
            birthDate =  ${Form.Schema.date().isRequired()}
            sports = ${Form.Schema.arrayOf( Form.Schema.string() ).validator('Count', {minimum: 1, maximum: 2})}
        }
    }

    action {
        message {
            type = 'Neos.Fusion.Form.Runtime:Message'
            options.message = afx`<h1>Thank you {data.firstName} {data.lastName}</h1>`
        }
        email {
            type = 'Neos.Fusion.Form.Runtime:Email'
            options {
                senderAddress = ${q(node).property('mailFrom')}
                recipientAddress = ${q(node).property('mailTo')}
                subject = ${q(node).property('mailSubject')}
                text = afx`Thank you {data.firstName} {data.lastName}`
                html = afx`<h1>Thank you {data.firstName} {data.lastName}</h1>`
                attachments {
                    upload = ${data.picture}
                }
            }
        }
    }
}

// Code is taken from https://github.com/neos/fusion-form/blob/master/Documentation/Examples/SingleStepForm.md

```

## Compile Javascript

The Javascript is compiled with [esbuild](https://esbuild.github.io/getting-started/#yarn-pnp).
Run the following commands on CLI:

```
yarn install
yarn build
```
