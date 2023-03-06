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
        this.formData = new FormData();
        this.action = form.attr('action');
        this.method = form.attr('method');
        this.fields = form.find('[name]');
        this.delay = false;
        if(config){
            this.delay = config.delay;
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
    confirmation(){
        const formData = this.formData;
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
    delayed(){
        return (this.delay === true) ? true : false;
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
    hasFunction(fn, paramObJ){
        if(fn){
            if(typeof window[fn] === "function"){
                window[fn](paramObJ);
            } else{
                console.error(fn + ' is not a window function');
            }
        } else return false;
    }
    submit(){
        if(!this.valid) return false;
        const $this = this;
        $.ajax({
            url: this.action,
            type: this.method,
            data: this.formData,
            processData: false,
            contentType: false,
            cache: false,
            beforeSend: function(jqXHR){
                if(!$this.hasFunction($this.before, {jqXHR: jqXHR})){
                    $this.beforeSend();
                }
            },
            success: function(data, jqXHR, textStatus){
                const paramObJ = { data: data, jqXHR: jqXHR, textStatus: textStatus };
                if(!$this.hasFunction($this.success, paramObJ)){
                    $this.done(data);
                }
            },
            error: function(error, jqXHR, textStatus, errorThrown){
                const paramObJ = {error: error, jqXHR: jqXHR, textStatus: textStatus, errorThrown: errorThrown};
                if(!$this.hasFunction($this.error, paramObJ)){
                    $this.fail(error, textStatus, errorThrown);
                }
            },
            complete: function(jqXHR, textStatus){
                const paramObJ = {jqXHR: jqXHR, textStatus: textStatus};
                if(!$this.hasFunction($this.complete, paramObJ)){
                    $this.always();
                }
            }
        });
    }
    trim(txt){
        if(txt.match(/.*\W$/g)) txt = txt.trim().slice(0, -1);
        return txt;
    }
    validate(){
        const $this = this;
        const formData = this.formData;

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
        if(!this.delayed()){
            this.submit(formData);
        }
    }
}
const vts = {};
// vts.before = 'beforeSwal';
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
        loadTitle: vts.loadTitle || lt,
        loadText: vts.loadText || lx,
        before: vts.before || vb,
        success: vts.success || vs,
        error: vts.error || ve,
        complete: vts.complete || vc
    });
});

// novalidate
$(document).ready(function(){ $('[vts]').attr('novalidate', true); });

// test/
function beforeSwal(){
    
}
function successSwal(){

}
function completeSwal(){

}
function errorSwal(){
    
}

$(document).on('submit', '#form1', function(e){
    e.preventDefault();
    new Vts($('#form1'), { delay: true }).validate();
});

$(document).on('submit', '#form2', function(e){
    e.preventDefault();
    const form1 = new Vts($('#form1'), { delay: true });
    const form2 = new Vts($('#form2'), { delay: true });

    for (var pair of form1.formData.entries()) {
        form2.formData.append(pair[0], pair[1]);
    }
    if(form1.valid) form2.submit();
});
