# vtsForm

Validate with a sweet alert, then submit the form using ajax by simply adding a vts attribute to your submit button!

**vtsForm requires jQuery and SweetAlert2**

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
