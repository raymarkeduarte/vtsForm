# vtsForm

Validate with SweetAlert2, then submit the form using AJAX by simply adding a `vts` attribute to your submit button!

### vtsForm requires [jQuery](https://jquery.com) and [SweetAlert2](https://sweetalert2.github.io)

## Installation

### CDN
```sh
<script src="https://cdn.jsdelivr.net/gh/raymarkeduarte/vtsForm@v1.0.1/vtsForm.js"></script>
```

## Basic Usage

### `form`
The `action` attribute will be used as the AJAX's **URL**, while the `method` attribute will be used as the AJAX's **type**.
```sh
<form action="/action_page.php" method="post">
```

### `label`

The label's text will be used as the **swal's title**.
The label tag must be a sibling of the input it is **for**.
```sh
<label for="first_name">First name:</label>
```
_If the label is not found, the **input's** `placeholder` will be used instead._


### `input`
The `title` attribute is optional. It is used as the **swal's text**.
```sh
<input type="text" id="first_name" name="first_name" placeholder="First name" required title="You must enter your first name!">
```
_You may omit the `placeholder` if you already have a `label`._


### `button`
Add the `vts` attribute to your submit button and use `type="button"`.
```sh
<button vts type="button">Submit form</button>
```

# You're all set!
<img width="470" alt="image" src="https://user-images.githubusercontent.com/108529045/218313594-3ccb6a32-370b-405e-b6b1-38dbcb576ff6.png">

## Confirmation
To validate whether a field's value matches another field's value, just append `_confirmation` to the name of confirmation field.
```sh
<input type="password" name="password" placeholder="New Password" required pattern=".{8,15}" title="Minimum of 8 characters. Maximum of 15 characters">
<input type="password" name="password_confirmation" placeholder="Repeat Password">
```
_The **swal title** will be generated automatically, but you are free to edit the JS file however you want._

## Configuration

## Server response

## Error
