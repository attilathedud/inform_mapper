'use strict';

(function( document, window, undefined ) {
	/* All element selectors */
	var command_pallet = document.getElementsByClassName('command-pallet')[ 0 ];
	var display_window = document.getElementById('display-window');
	var about_link = document.getElementById('about-link');
	var about_text = document.getElementById('about-text');
	var contact_link = document.getElementById('contact-link');
	var contact_text = document.getElementById('contact-text');
	var input = document.getElementsByClassName( 'input-file' )[ 0 ];
	var upload = document.getElementsByClassName( 'submit-file-button')[ 0 ];

	/* Helper function to add text to the display and automatically scroll to the bottom */
	function append_text_to_display_window( text ) {
		display_window.innerHTML += text;
		display_window.scrollTop = display_window.scrollHeight;
	}

	/* Check for canvas and es5 support */
	if( !Modernizr.canvas && !Modernizr.es5 ) {
		append_text_to_display_window('<h5>Warning</h5><p>To use this site, your browser needs to support canvas and es5.</p>')
	}

	/* Wire up the command pallet */
	command_pallet.focus();

	document.addEventListener( 'click', function( e ) {
		command_pallet.focus();
		// To fix a bug where a mobile keyboard would cut off the bottom of the display window text,
		// we disable scrolling on mobile and set the hash to the command element so it is scrolled to.
		location.hash = "command"
	})

	/* On the about and contact click events, populate the display window with associated text. */
	about_link.addEventListener( 'click', function( e ) {
		append_text_to_display_window( about_text.innerHTML );
	});

	contact_link.addEventListener( 'click', function( e ) {
		append_text_to_display_window( contact_text.innerHTML );
	});

	/* Logic for command pallet */
	command_pallet.addEventListener( 'keypress', function( e ) {
		if( e.which == 13 ) {
			var command = command_pallet.value.split(' ')[ 0 ].toLowerCase();

			if( command.indexOf('about') != -1 ) {
				about_link.click();
			}
			else if( command.indexOf('contact') != -1 ) {
				contact_link.click();
			}
			else if( command.indexOf('choose') != -1 ) {
				input.click();
			}
			else if( command.indexOf('upload') != -1 ) {
				if( upload.style.display == 'inline-block') {
					upload.click();
				}
				else {
					append_text_to_display_window('<h5>Error</h5><p>Please choose a file first.</p>'); 
				}
			}
			else if( command.indexOf('clear') != -1 ) {
				display_window.innerHTML = '<p>You\'re confused. Choose an inform file below or type `choose` and hit enter.</p>';
			}
			else {
				append_text_to_display_window('<h5>Error</h5><p>I don\'t understand. Try `about`, `contact`, `clear`, `choose`, or `upload`.</p>'); 
			}

			command_pallet.value = '';
		}
	});

	/* Modified code based on the file upload code by Osvaldas Valutis, www.osvaldas.info */
	var label = input.nextElementSibling;

	input.addEventListener( 'change', function( e ) {
		var filename = '';

		if( this.files.length > 0 ) {
			filename = e.target.value.split( '\\' ).pop();
		}

		if( filename ) {
			label.querySelector( 'span' ).innerHTML = filename;
		}

		if( this.files.length > 0 ) {
			upload.style.display = 'inline-block';
			upload.style.left = input.scrollWidth + upload.scrollWidth + 18 + "px";
			upload.focus();
			append_text_to_display_window('<h5>File Ready</h5><p>' + filename + ' chosen. Click upload or type `upload` and hit enter.</p>'); 
		}
	});

	// Firefox bug fix
	input.addEventListener( 'focus', function(){ input.classList.add( 'has-focus' ); });
	input.addEventListener( 'blur', function(){ input.classList.remove( 'has-focus' ); });

}(document, window));
