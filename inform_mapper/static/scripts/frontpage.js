'use strict';

(function( document, window, undefined ) {
	/*!
	*	Modified code based on the file upload code by Osvaldas Valutis, www.osvaldas.info
	*/
	var input = document.getElementsByClassName( 'input-file' )[ 0 ];
	var upload = document.getElementsByClassName( 'submit-file-button')[ 0 ];

	var label = input.nextElementSibling;
	var old_label_val = label.innerHTML;

	input.addEventListener( 'change', function( e ) {
		var filename = '';

		if( this.files.length > 0 ) {
			filename = e.target.value.split( '\\' ).pop();
		}

		if( filename ) {
			label.querySelector( 'span' ).innerHTML = filename;
		}
		else {
			label.innerHTML = old_label_val;
		}

		if( this.files.length > 0 ) {
			upload.style.display = 'inline-block';
			upload.style.left = input.scrollWidth + upload.scrollWidth + 5 + "px";
			upload.focus();
		}
	});

	// Firefox bug fix
	input.addEventListener( 'focus', function(){ input.classList.add( 'has-focus' ); });
	input.addEventListener( 'blur', function(){ input.classList.remove( 'has-focus' ); });

}(document, window));
