'use strict';

(function( document, window, undefined ) {

    /* Selectors */
    var id_nodes = document.getElementsByClassName("object_id");
    var description_nodes = document.getElementsByClassName("object_description");
    var parent_nodes = document.getElementsByClassName("object_parent");
    var child_nodes = document.getElementsByClassName("object_child");
    var property_number_nodes = document.getElementsByClassName("object_property_number");
    var property_value_nodes = document.getElementsByClassName("object_property_value");
    
    var object_nodes = [];
    var object_edges = [];

    /* Generate the graph nodes and edges */
    function add_node( id, name ) {
        object_nodes.push({ data: { id: id, name: name }, classes : 'multiline-auto' });
    }

    function add_edge( source, target ) {
        var edge_exists = false;

        var edge_value = { data: { source: source, target: target } }

        for( var i = 0; i < object_edges.length; i++ ) {
            if( object_edges[i].data.source === edge_value.data.source && 
                object_edges[i].data.target === edge_value.data.target ) {
                    edge_exists = true;
                    break;
            }
        }

        if( !edge_exists ) {
            object_edges.push( edge_value );
        }
    }

    for( var i = 0; i < description_nodes.length; i++ ) {
        add_node( id_nodes[ i ].innerHTML, description_nodes[ i ].innerHTML );

        if( parent_nodes[ i ].innerHTML != "0" ) {
            add_edge( id_nodes[ i ].innerHTML, parent_nodes[ i ].innerHTML );
        }

        if( child_nodes[ i ].innerHTML != "0" ) {
            add_edge( child_nodes[ i ].innerHTML, id_nodes[ i ].innerHTML );
        }
    }

    var compass_node = -1;
    var compass_directions = {}

    for( var i = 0; i < description_nodes.length; i++ ) {
        if( description_nodes[ i ].innerHTML == "compass" ) {
            compass_node = id_nodes[ i ].innerHTML;
        }

        if( parent_nodes[ i ].innerHTML == compass_node ) {
            compass_directions[ id_nodes[ i ].innerHTML ] = description_nodes[ i ].innerHTML.replace(" wall", "");
        }
    }

    for( var i = 0; i < property_number_nodes.length; i++ ) 
    {
        for( var direction_id in compass_directions ) {
            if( property_number_nodes[ i ].innerHTML == direction_id ) {
                var object_id = property_number_nodes[ i ].parentNode.parentNode.parentNode.getElementsByClassName('object_id')[ 0 ].innerHTML;
                var destination = parseInt( property_value_nodes[ i ].innerHTML, 16 );
                
                if( destination > 0 && destination < id_nodes.length) {
                    var edge_value = { data: { source: object_id, target: destination, label: compass_directions[direction_id] }, classes: 'autorotate edge-direction' };
                    object_edges.push( edge_value );
                }
            }
        }
    }

    var cy;

    /* Generate the graph */
    fetch('static/style/graph.json', {mode: 'no-cors'})
        .then( function( res ) {
            return res.json()
        }) 
        .then( function( style ) {
            cy = cytoscape({
                container: document.querySelector('#cy'),
            
                boxSelectionEnabled: true,
            
                style: style,
            
                elements: {
                    nodes: object_nodes,
                    edges: object_edges
                },
            
                layout: {
                    name: 'cose-bilkent',
                    nodeRepulsion: 7000,
                    idealEdgeLength: 200,
                    tilingPaddingVertical: 20,
                    tilingPaddingHorizontal: 20
                },
            });
            
            cy.ready( function( e ) {
                document.getElementById('loading').style.display = 'none';
            });

            cy.on( 'select', function( event ) {
                if( event.target === cy ) {
                    cy.$().removeClass('selected');
                }
                else {
                    event.target.addClass('selected');
                }
            });

            cy.on( 'tap', function( event ) {
                cy.$().removeClass('selected');
            });
        }); 

    /* Wire up the accordion dropdowns */
    var accordion_elements = document.getElementsByClassName("accordion");
    
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
    
    /* Wire up search box */
    var search_box = document.getElementById('search-box');
    search_box.focus();

    document.addEventListener( 'click', function( e ) {
		search_box.focus();
    })
    
    var finder;
    var previous_hidden_elements;

    function init_search() {
        if( finder ) {
            finder.revert();
        }

        cy.batch( function() {
            if( previous_hidden_elements ) {
                previous_hidden_elements.removeClass('hidden-transparent');

                if( document.getElementById('chkzoompan').checked ) {
                    cy.animate({
                        fit : {
                            eles: cy.$(),
                            padding: 20
                        }
                    }, {
                        duration: 500
                    });
                }
            }
        });

        if( search_box.value.replace(' ', '').length > 0 ) {
            cy.batch( function( ){
                var found = cy.$( 'node[name @*="' + search_box.value + '"]' ).closedNeighborhood();
                previous_hidden_elements = cy.elements().not( found );

                previous_hidden_elements.addClass('hidden-transparent');
            
                if( document.getElementById('chkzoompan').checked ) {
                    cy.animate({
                        fit: {
                            eles: found,
                            padding: 20
                        }
                    }, {
                        duration: 500
                    });
                }
            });

            finder = findAndReplaceDOMText(document.getElementById('info-box'), {
                find: new RegExp(search_box.value, "gi"),
                wrap: 'span',
                wrapClass: 'highlight'
            });

            if( document.getElementById('chkscrolltext').checked ) {
                for( var i = 0; i < accordion_elements.length; i++ ) {
                    if( accordion_elements[ i ].classList.contains( 'active' ) ) {
                        accordion_elements[ i ].click();
                    }
                }
    
                var word_panel_set = false;
                var object_panel_set = false;
                var selections = document.getElementsByClassName( 'highlight' );
    
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
    
                    if( !cur_selection_parent.parentNode.getElementsByClassName('accordion')[0].classList.contains( 'active' ) ) {
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
    var clear_icon = document.getElementsByClassName('clear-icon')[ 0 ];

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

    
}(document, window));
