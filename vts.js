/**
 * @description - validate the submit via ajax
 * @author RED
 * @class Vts
 */
class Vts {
    /**
     * Creates an instance of Vts.
     * @author RED
     * @param {Element} form
     * @param {object} [config]
     * @memberof Vts
     */
    constructor(form, config) {
        this.formElem = form;
        this.action = form.attr('action');
        this.method = form.attr('method');
        this.fields = form.find('[name]');
        if(config){
            this.before = config.before;
            this.success = config.success;
            this.error = config.error;
            this.complete = config.complete;
        }
        this.validate();
    }
    alert(msg){
        if(this.hasSwal()){
            Swal.fire(msg);
        } else{
            if(msg.text) msg.text = ': '+msg.text
            alert(msg.title + msg.text);
        }
    }
    always(){
        if(!this.hasSwal()){
            this.formElem.find('[type=submit]').text(this.submitBtnText);
            delete this.submitBtnText;
        }
    }
    beforeSend(){
        if(this.hasSwal()){
            Swal.fire({
                title: this.loadingTitle || 'Loading...',
                text: this.loadingText || 'Please wait.',
                allowEscapeKey: false,
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
        } else{
            this.submitBtnText = this.formElem.find('[type=submit]').text();
            this.formElem.find('[type=submit]').text('Loading...');
        }
    }
    confirmation(formData){
        const currentField = this.currentField;
        const confirmPattern = /.*\_confirmation$/g;
        const has_confirmation = (currentField.name.match(confirmPattern));
        if(has_confirmation){
            // get the value of the field being compared
            const name = currentField.name.slice(0, -13);
            const val = formData.get(name);
            const conField = $(this.formElem).find('[name='+name+']');
            if(conField.length === 0){
                this.alert({
                    title: 'Vts error: Invalid syntax',
                    text: 'Plese check the prefix name of your "_confirmation" field.'
                });
                return false;
            } else{
                if(currentField.value != val){
                    this.matchMsg = this.getTitle(currentField)+' does not match '+this.getTitle(conField);
                    currentField.setCustomValidity(this.matchMsg);
                } else{
                    currentField.setCustomValidity('');
                }
            }
        }
    }
    done(response){
        if(this.hasSwal()){
            Swal.hideLoading();
            Swal.fire({
                title: response.title ?? 'Message: ',
                text: response.text,
                icon: response.icon
            });
        } else{
            alert('Success');
        }
    }
    errorPage(html){
        const newWindow = window.open();
        newWindow.document.body.innerHTML = html;
    }
    fail(error, textStatus, errorThrown){
        const customError = error.responseJSON;
        const hasCustomError = ('responseJSON' in error && 'title' in error.responseJSON);
        const html  = (hasCustomError) ? customError.text : errorThrown;
        const icon  = (hasCustomError) ? customError.icon : 'error';
        const cLog = error.responseText;
    
        let title = (hasCustomError) ? customError.title : textStatus+': '+error.status;
        if(error.status === 0){
            title = 'Please check your connection.';
        }
        
        if(this.hasSwal()){
            Swal.fire({
                title: title,
                html: html,
                icon: icon,
                showDenyButton: true,
                denyButtonText: 'View more details'
                }).then((result) => {
                if(result.isDenied) 
                    this.errorPage(cLog);
            });
        } else{
            const text = title+'\nClick ok to view more details.'+"\n"+html;
            if(confirm(text) == true){
                this.errorPage(cLog);
            }
        }
        console.log(cLog);
    }   
    getTitle(field){
        const label = $(field).siblings('label').first().text();
        const fieldName = label || $(field).attr('placeholder');
        return this.trim(fieldName);
    }
    hasSwal(){
        if(typeof window['swal'] === "function") return true;
        else return false;
    }
    submit(formData){
        if(!this.valid) return false;
        const $this = this;
        $.ajax({
            url: this.action,
            type: this.method,
            data: formData,
            processData: false,
            contentType: false,
            cache: false,
            beforeSend: function(){
                $this.beforeSend();
            },
            success: function(response){
                $this.done(response);
            },
            error: function(error, textStatus, errorThrown){
                $this.fail(error, textStatus, errorThrown);
            },
            complete: function(){
                $this.always();
            }
        });
    }
    trim(txt){
        if(txt.match(/.*\W$/g)) txt = txt.trim().slice(0, -1);
        return txt;
    }
    validate(){
        this.formElem.attr('novalidate', true);
        const $this = this;
        const formData = new FormData();

        $.each(this.fields, function(i, field){
            $this.currentField = field;

            if($this.confirmation(formData) === false) return false;

            if(field.checkValidity()){
                $this.valid = true;
                formData.append(field.name, field.value);
            } else{
                $this.valid = false;
                const invalidTitle = $(field).attr('vts-invalid') || 'Invalid ' + $this.getTitle(field);
                const invalidIcon = $(field).attr('vts-invalid-icon') || 'warning';
                let invalidHint = $(field).attr('title') || field.validationMessage || '';
                field.focus();
                $this.alert({
                    title: invalidTitle,
                    icon: invalidIcon,
                    text: invalidHint
                });
                return false;
            }
        });
        this.submit(formData);
    }
}

// Event listener
$(document).on('submit', '[vts]', function(e){
    e.preventDefault();
    const lt = $(this).attr('vts-load-title');
    const lx = $(this).attr('vts-load-text');
    const vb = $(this).attr('vts-before');
    const vs = $(this).attr('vts-success');
    const ve = $(this).attr('vts-error');
    const vc = $(this).attr('vts-complete');
    new Vts($(this), {
        loadTitle: lt,
        loadText: lx,
        before: vb,
        success: vs,
        error: ve,
        complete: vc
    });
});

// novalidate
$(document).ready(function(){ $('[vts]').attr('novalidate', true); });