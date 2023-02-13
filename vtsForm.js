/**
 * @description Validate with a sweet alert, then submit the form using ajax.
 * @author RED
 * @param {Element} form
 * @param {String} loadTitle
 * @param {String} loadHTML
 */
function vtsForm(form, loadTitle, loadHTML){
    const action = $(form).attr('action');
    const method = $(form).attr('method');
    const input = $(form).find('input');
    const select = $(form).find('select');
    const textarea = $(form).find('textarea');
    const fields = [input, select, textarea];
    let valid = false;
    let matchMsg = '';
    let formData = new FormData();

    $.each(fields, function(x, field){
        // continue to the next field type if 'this' is empty.
        if(field.length === 0) return;

        $.each(field, function(i, elem){
            /**
             * @description get the text of the 'this' field's sibling label or its placeholder
             * @param {Element} f
             * @returns {string} 
             */
            function fieldName(f){
                const label = $(f).siblings('label').first().text();
                const fieldName = trimLabel( label || $(f).attr('placeholder') );
                return fieldName;
            }

            const confirmPattern = /.*\_confirmation$/g;
            const has_confirmation = (field[i].name.match(confirmPattern));
            if(has_confirmation){
                // get the name of the field being compared
                const name = field[i].name.slice(0, -13);
                // get its value
                const val = formData.get(name);
                const conField = $(form).find('[name='+name+']')
                if(conField.length === 0){
                    Swal.fire({
                        title: 'vtsForm error!',
                        text: 'Plese check the prefix name of your "_confirmation" field.',
                        icon: 'error'
                    });
                }
                // compare
                if(field[i].value != val){
                    matchMsg = fieldName(field[i])+' does not match '+fieldName(conField);
                    field[i].setCustomValidity(matchMsg);
                } else field[i].setCustomValidity('');
            }

            // check the validity of 'this' field
            if(field[i].checkValidity()){
                valid = true;
                formData.append(field[i].name, field[i].value);
            } else{
                valid = false;
                let type = $(field[i]).attr('vtsWarn') || 'Invalid';
                const title = (matchMsg) ? matchMsg : type + ' ' + fieldName(field[i]);
                const note = field[i].title || '';
                let icon = $(field[i]).attr('vtsIcon')  || 'warning';

                field[i].focus()
                Swal.fire({
                    title: title,
                    text: note,
                    icon: icon
                });
                return false;
            }
        });

        // break loop if 'this' input is invalid
        if(!valid) return false;

    });

    // AJAX
    if(valid){
        $.ajax({
            url: action,
            type: method,
            data: formData,
            processData: false,
            contentType: false,
            cache: false,
            beforeSend: function() {
                Swal.fire({
                    title: loadTitle,
                    html: loadHTML,
                    allowEscapeKey: false,
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });
            },
            success: function(response) {
                // Swal.hideLoading();
                Swal.fire({
                    title: response.title ?? 'Message: ',
                    text: response.text,
                    icon: response.icon
                });
            },
            error: function(error, textStatus, errorThrown) {
                const customError = error.responseJSON;
                const hasCustomError = ('responseJSON' in error && 'title' in error.responseJSON);
                let title = (hasCustomError) ? customError.title : textStatus+': '+error.status;
                if(error.status === 0) title = 'Please check your connection.';
                let html  = (hasCustomError) ? customError.text : errorThrown;
                const icon  = (hasCustomError) ? customError.icon : 'error';
                const cLog = error.responseText;
                Swal.fire({
                    title: title,
                    html: html,
                    icon: icon
                });
                console.log(cLog);
            }
        });
    }
}

/**
 * @description trim and remove each non-word character at the end
 * @param {string} label
 * @returns {string} 
 */
function trimLabel(label){
    while(label.match(/.*\W$/g)){
        label = label.slice(0, -1)
    }
    return label;
}

// initialize vts
$(document).ready(function(){
    $('[vts]').each(function(){
        $(this).click(function(){
            const loadTitle = $(this).attr('vts') || 'Loading...';
            const loadText = $(this).attr('vtsText') || 'Please wait';
            vtsForm( $(this).closest('form'), loadTitle,  loadText );
        });
    });
});