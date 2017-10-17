'use strict';

var Graph = (function( ) {

    /* Members */
    var _object_nodes;
    var _object_edges;

    var _id_nodes;
    var _description_nodes;
    var _parent_nodes;
    var _child_nodes; 
    var _property_number_nodes;
    var _property_value_nodes;

    var _cy;

    var _last_search_hidden_members;
    var _last_selected_object_floor;

    function Graph() {
        _object_nodes = [];
        _object_edges = [];

        _last_selected_object_floor = 1;
    }

    /* Given an id and a name, add a node to the object_nodes array */
    function add_node( id, name ) {
        _object_nodes.push({ data: { id: id, name: name }, classes : 'multiline-auto' });
    }

    /* Given a source and a target, add an edge if one doesn't already exist */
    function add_edge( source, target ) {
        var edge_exists = false;
        var edge_value = { data: { source: source, target: target } }

        for( var i = 0; i < _object_edges.length; i++ ) {
            if( _object_edges[i].data.source === edge_value.data.source && 
                _object_edges[i].data.target === edge_value.data.target ) {
                    edge_exists = true;
                    break;
            }
        }

        if( !edge_exists ) {
            _object_edges.push( edge_value );
        }
    }
    
    /* Given an array of object information, fill our nodes and edges */
    Graph.prototype.fill_nodes_and_edges = function( id_nodes, description_nodes, parent_nodes, 
        child_nodes, property_number_nodes, property_value_nodes  ) {

        _id_nodes = id_nodes;
        _description_nodes = description_nodes;
        _parent_nodes = parent_nodes;
        _child_nodes = child_nodes;
        _property_number_nodes = property_number_nodes;
        _property_value_nodes = property_value_nodes;

        var compass_node = -1;
        var compass_directions = {}

        for( var i = 0; i < _description_nodes.length; i++ ) {
            add_node( _id_nodes[ i ].innerHTML, _description_nodes[ i ].innerHTML );
    
            if( _parent_nodes[ i ].innerHTML != "0" ) {
                add_edge( _id_nodes[ i ].innerHTML, _parent_nodes[ i ].innerHTML );
            }
    
            if( _child_nodes[ i ].innerHTML != "0" ) {
                add_edge( _child_nodes[ i ].innerHTML, _id_nodes[ i ].innerHTML );
            }

            if( description_nodes[ i ].innerHTML == "compass" ) {
                compass_node = id_nodes[ i ].innerHTML;
            }
    
            if( parent_nodes[ i ].innerHTML == compass_node ) {
                compass_directions[ id_nodes[ i ].innerHTML ] = 
                    description_nodes[ i ].innerHTML.replace(" wall", "");
            }
        }
    
        for( var i = 0; i < _property_number_nodes.length; i++ ) 
        {
            for( var direction_id in compass_directions ) {
                if( _property_number_nodes[ i ].innerHTML == direction_id ) {
                    var object_id = _property_number_nodes[ i ].dataset.parentId;
                    var destination = parseInt( _property_value_nodes[ i ].innerHTML, 16 );
                    
                    if( destination > 0 && destination < id_nodes.length) {
                        var edge_value = { data: { source: object_id, target: destination, 
                            label: compass_directions[ direction_id ] }, 
                            classes: 'autorotate edge-direction' };

                        _object_edges.push( edge_value );
                    }
                }
            }
        }
    };

    /* Create the graph instance */
    Graph.prototype.create_cy_graph = function( loading_div, node_info_container, node_info_box ) {
        fetch('static/style/graph.json', { mode: 'no-cors' } )
            .then( function( res ) {
                return res.json()
            }) 
            .then( function( style ) {
                _cy = cytoscape({
                    container: document.querySelector('#cy'),

                    boxSelectionEnabled: true,
                
                    style: style,
                
                    elements: {
                        nodes: _object_nodes,
                        edges: _object_edges
                    },

                    layout: {
                        name: 'cose',
                        nodeDimensionsIncludeLabels: true,
                        idealEdgeLength: 200,
                        edgeElasticity: 4000,
                        nodeRepulsion: 7000,
                        componentSpacing: 100,
                    }
                });
                
                _cy.ready( function( e ) {
                    loading_div.style.display = 'none';
                    add_cy_event_handlers( node_info_container, node_info_box );
                });
            }); 
    };

    /* Add tap handlers for the info box */
    function add_cy_event_handlers( node_info_container, node_info_box ) {
        _cy.on( 'select', function( event ) {
            if( event.target === _cy ) {
                _cy.batch( function() {
                    _cy.$().removeClass( 'selected' );
                });

                node_info_container.style.display = 'none';
            }
            else {
                node_info_container.style.display = 'block';
                event.target.addClass( 'selected' );
                
                var id = event.target.id() - 1;

                if( id ) {
                    var properties = '';
                    
                    for( var i = 0; i < _property_number_nodes.length; i++ ) 
                    {
                        var object_id = _property_number_nodes[ i ].dataset.parentId;

                        if( object_id > id ) {
                            break;
                        }

                        if( object_id == id ) {
                            properties += _property_number_nodes[ i ].innerHTML + 
                                "<span class='u-pull-right'>" + _property_value_nodes[ i ].innerHTML + 
                                "</span><br/>";
                        }
                    }

                    node_info_box.innerHTML = "<span id='node-selected'>" + _id_nodes[ id ].innerHTML + 
                        "</span>.\"" + _description_nodes[ id ].innerHTML + "\"" + "<br/>" + "Parent: " + 
                        _parent_nodes[ id ].innerHTML + "<br/>Child: " + _child_nodes[ id ].innerHTML +
                        "<br/><div class='accordion-header'>Properties</div>" + properties;
                }
            }
        });

        _cy.on( 'tap', function( event ) {
            _cy.batch( function() {
                _cy.$().removeClass( 'selected' );
            });

            node_info_container.style.display = 'none';
        });
    };

    /* Clear set highlighting and restore the opacity of all nodes previously hidden */
    Graph.prototype.clear_highlights = function( zoom_pan ) {
        _cy.batch( function() {
            if( _last_search_hidden_members ) {
                _last_search_hidden_members.removeClass( 'hidden-transparent' );

                if( zoom_pan.checked ) {
                    _cy.animate({
                        fit : {
                            eles: _cy.$(),
                            padding: 20
                        }
                    }, {
                        duration: 500
                    });
                }
            }
        });
    };

    /* Hide all nodes not connected to the one selected */
    Graph.prototype.highlight_neighbors = function( query, zoom_pan ) {
        _cy.batch( function( ){
            var found = _cy.$( query ).closedNeighborhood();
            _last_search_hidden_members = _cy.elements().not( found );

            _last_search_hidden_members.addClass('hidden-transparent');
        
            if( zoom_pan.checked ) {
                _cy.animate({
                    fit: {
                        eles: found,
                        padding: 20
                    }
                }, {
                    duration: 500
                });
            }
        });
    };

    /* Toggle display of compass edges */
    Graph.prototype.toggle_labelled_edges = function( display ) {
        _cy.batch( function( ){
            var found = _cy.edges('edge[?label]');

            if( display ) {
                found.removeClass('hidden');
            }
            else {
                found.addClass('hidden');
            }
        });
    };

    /* Hide all objects that match query */
    Graph.prototype.hide_objects = function( query ) {
        _cy.batch( function() {
            var found = _cy.nodes( query );
            found.addClass('hidden');
        });
    };

    /* Hide all objects up to the id floor */
    Graph.prototype.hide_objects_to_floor = function( floor ) {
        _cy.batch( function() {
            if( _last_selected_object_floor > parseInt( floor ) ) {
                var found = _cy.nodes('node[id<' + _last_selected_object_floor + ']');
                found.removeClass('hidden');
            }

            hide_objects( 'node[id<' + parseInt( floor ) + ']' );
        });

        _last_selected_object_floor = parseInt( floor );
    };
    
    /* Reset all effects applied to the graph */
    Graph.prototype.reset = function() {
        _cy.batch( function() {
            _cy.$().removeClass('hidden');
            _cy.$().removeClass('hidden-transparent');
            _cy.$().removeClass('selected');

            _cy.animate({
                fit : {
                    eles: _cy.$(),
                    padding: 20
                }
            }, {
                duration: 500
            });
        });
    };

    /* Provide a blob version for download */
    Graph.prototype.get_png_blob = function() {
        return _cy.png({
            output: 'blob'
        });
    };

    return Graph;
}());