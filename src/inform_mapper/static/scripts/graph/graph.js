'use strict';

(function( document, window, undefined ) {

    /* Selectors */
    var object_info_nodes = document.getElementsByClassName("object-info");
    var property_number_nodes = document.getElementsByClassName("object-property-number");
    var property_value_nodes = document.getElementsByClassName("object-property-value");
    var loading_div = document.getElementById('loading');
    var node_info_container = document.getElementById('node-info-container');
    var node_info_box = document.getElementById('node-info-box');
    var accordion_elements = document.getElementsByClassName("accordion");
    var search_box = document.getElementById('search-box');
    var clear_icon = document.getElementsByClassName('clear-icon')[ 0 ];
    var download_png = document.getElementById( 'download-png' );
    var compass_routing = document.getElementById( 'compass-routing' );
    var inform_object_floor = document.getElementById( 'inform-object-floor' );
    var reset_graph = document.getElementById('reset-graph');
    var highlight_icon = document.getElementsByClassName('highlight-icon')[ 0 ];
    var unhighlight_icon = document.getElementsByClassName('unhighlight-icon')[ 0 ];
    var hide_icon = document.getElementsByClassName('hide-icon')[ 0 ];
    var zoom_pan = document.getElementById('zoom-pan');
    var menu_slide_out = document.getElementById('menu');
    var info_box = document.getElementById('info-box');
    var graph_container = document.getElementById('cy');

    /* Store the state of the node info box for mobile displays */
    var is_node_info_showing = false;

    /* Used to revert changes to the findAndReplaceDOMText operations*/
    var finder;
    
    /* Initialize the graph */
    var graph = new Graph();
    
    graph.fill_nodes_and_edges( object_info_nodes, property_number_nodes, property_value_nodes );

    graph.create_cy_graph( loading_div, node_info_container, node_info_box );

    /* Wire up the accordion dropdowns */
    for (var i = 0; i < accordion_elements.length; i++) {
        accordion_elements[i].addEventListener( 'click', function( e ) {
            this.classList.toggle( 'active' );
            var panel = this.nextElementSibling;
    
            if ( panel.style.maxHeight ) {
                panel.style.maxHeight = null;
            } else {
                panel.style.maxHeight = panel.scrollHeight + "px";
            } 
        });
    } 

    // Open up settings when loading
    accordion_elements[ accordion_elements.length - 1 ].click();
    
    function init_search() {
        if( finder ) {
            finder.revert();
        }

        graph.clear_highlights( zoom_pan );

        // Strip out spaces as to not lag the page down searching for every space
        var search_term = search_box.value.replace(new RegExp(' ', 'g'), '');
        if( search_term.length > 0 ) {
            graph.highlight_neighbors( 'node[name @*="' + search_box.value + '"]', zoom_pan );

            finder = findAndReplaceDOMText( info_box, {
                find: new RegExp(search_box.value, "gi"),
                wrap: 'span',
                wrapClass: 'highlight'
            });

            if( document.getElementById('scroll-to-text').checked ) {
                for( var i = 0; i < accordion_elements.length; i++ ) {
                    if( accordion_elements[ i ].classList.contains( 'active' ) ) {
                        accordion_elements[ i ].click();
                    }
                }
    
                var word_panel_set = false;
                var object_panel_set = false;
                var selections = document.getElementsByClassName( 'highlight' );
    
                // For each selection, loop up until we find the associated accordion section and expand it.
                // If selection is inside a scrollable div, set the scrollHeight to that element and then
                // disable the logic so we stop on the first element found in that section.
                for( var i = 0; i < selections.length; i++ ) {
                    var cur_selection_parent = selections[ i ];
    
                    while( cur_selection_parent && cur_selection_parent.classList &&
                        (!cur_selection_parent.classList.contains( 'panel' ) && !cur_selection_parent.classList.contains( 'accordion' ) ) ) {
                            if( !word_panel_set && cur_selection_parent.classList.contains( 'word-panel' )) {
                                cur_selection_parent.scrollTop = selections[ i ].offsetTop - cur_selection_parent.offsetTop;
                                word_panel_set = true;
                            }
        
                            if( !object_panel_set && cur_selection_parent.classList.contains( 'object-panel' )) {
                                cur_selection_parent.scrollTop = selections[ i ].offsetTop - cur_selection_parent.offsetTop;
                                object_panel_set = true;
                            }
                            
                            cur_selection_parent = cur_selection_parent.parentNode;
                    }
    
                    if( cur_selection_parent && cur_selection_parent.parentNode &&
                        (!cur_selection_parent.parentNode.getElementsByClassName('accordion')[0].classList.contains( 'active' ) ) ) {
                        cur_selection_parent.parentNode.getElementsByClassName('accordion')[0].click();
                    }   
                }
            }
        }
    }

    search_box.addEventListener( 'keypress', function( e ) {
        if( e.which == 13 ) {
            search_box.select();
            init_search();
        }
    });

    /* Wire up clear search button */
    search_box.addEventListener('keyup', function( e ) {
        if( search_box.value.replace(' ', '').length > 0 ) {
            clear_icon.style.display = 'block';
        }
        else {
            clear_icon.style.display = 'none';
        }
    });

    clear_icon.addEventListener('click', function( e ) {
        search_box.value = '';
        clear_icon.style.display = 'none';
        init_search();
    });

    /* Wire up options */
    download_png.addEventListener('click', function( e ) {
        var blob = graph.get_png_blob();

        var filename = document.getElementById( 'filename' ).innerHTML;
        filename = filename.substr( 0, filename.lastIndexOf( '.' ) ) + ".png";
        
        saveAs(blob, filename);
    });

    compass_routing.addEventListener('click', function( e ) {
        graph.toggle_labelled_edges( compass_routing.checked );
    });

    // To make this selection play nice with the search box
    inform_object_floor.addEventListener('click', function( e ) {
        e.stopPropagation();
    });

    inform_object_floor.addEventListener('change', function( e ) {
        graph.hide_objects_to_floor( inform_object_floor.value );
    });

    reset_graph.addEventListener('click', function( e ) {
        graph.reset();

        inform_object_floor.value = "1";
        compass_routing.checked = true;
        zoom_pan.checked = true;

        node_info_container.style.display = 'none';
    });

    function generate_nodes_selected_query_string() {
        var nodes_selected = document.getElementsByClassName('node-selected');
        var query_string = '';

        for( var i = 0; i < nodes_selected.length; i++ ) {
            query_string += 'node[id="' + nodes_selected[i].innerHTML + '"],';
        }

        query_string = query_string.substring(0, query_string.length - 1);

        return query_string;
    }

    /* Node info box */
    highlight_icon.addEventListener( 'click', function( e ) {
        graph.clear_highlights( zoom_pan );
        graph.highlight_neighbors( generate_nodes_selected_query_string(), zoom_pan );
    });

    unhighlight_icon.addEventListener( 'click', function( e ) {
        graph.clear_highlights( zoom_pan );
    });

    hide_icon.addEventListener( 'click', function( e ) {
        graph.hide_objects( generate_nodes_selected_query_string() );

        node_info_container.style.display = 'none';
    });

    /* Menu button */
    menu_slide_out.addEventListener( 'click', function( e ) {
        info_box.classList.toggle( "slide-in" );
        graph_container.classList.toggle( "slide-out" );

        if( menu_slide_out.innerHTML.trim()[0] == "M" ) {
            if( node_info_container.style.display != 'none' ) {
                is_node_info_showing = true;
                node_info_container.style.display = 'none';
            }

            menu_slide_out.innerHTML = "G<br>R<br>A<br>P<br>H";
        }
        else {
            if( is_node_info_showing ) {
                is_node_info_showing = false;
                node_info_container.style.display = 'block';
            }

            menu_slide_out.innerHTML = "M<br>E<br>N<br>U";
        }
    });
    
}(document, window));
