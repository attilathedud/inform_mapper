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

    //if compass nav turned on
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

    /* Generate the graph */
    fetch('static/style/graph.json', {mode: 'no-cors'})
        .then( function( res ) {
            return res.json()
        }) 
        .then( function( style ) {
            var cy = cytoscape({
                container: document.querySelector('#cy'),
            
                boxSelectionEnabled: false,
                autounselectify: true,
            
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
                }
            });
        }); 

    /* Wire up the accordion dropdowns */
    var accordion_elements = document.getElementsByClassName("accordion");
    
    for (var i = 0; i < accordion_elements.length; i++) {
        accordion_elements[i].addEventListener( 'click', function( e ) {
            this.classList.toggle("active");
            var panel = this.nextElementSibling;
    
            if (panel.style.maxHeight) {
                panel.style.maxHeight = null;
            } else {
                panel.style.maxHeight = panel.scrollHeight + "px";
            } 
        });
    }    
}(document, window));
