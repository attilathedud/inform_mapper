'use strict';

var id_nodes = document.getElementsByClassName("object_id");
var description_nodes = document.getElementsByClassName("object_description");
var parent_nodes = document.getElementsByClassName("object_parent");
var child_nodes = document.getElementsByClassName("object_child");

var object_nodes = [];
var object_edges = [];

for( var i = 0; i < description_nodes.length; i++ ) {
    var edge_exists = false;

    object_nodes.push({ data: { id: id_nodes[ i ].innerHTML, name: description_nodes[ i ].innerHTML }, classes : 'multiline-auto' });
    
    if( parent_nodes[ i ].innerHTML != "0" ) {
        edge_value = { data: { source: id_nodes[ i ].innerHTML, target: parent_nodes[ i ].innerHTML } }
        
        for( var j = 0; j < object_edges.length; j++ ) {
            if( object_edges[j].data.source === edge_value.data.source && 
            object_edges[j].data.target === edge_value.data.target ) {
                edge_exists = true;
            }
        }

        if( !edge_exists ) {
            object_edges.push( edge_value );
        }
    }

    edge_exists = false;

    if( child_nodes[ i ].innerHTML != "0" ) {
        edge_value = { data: { source: child_nodes[ i ].innerHTML, target: id_nodes[ i ].innerHTML } };

        for( var j = 0; j < object_edges.length; j++ ) {
            if( object_edges[j].data.source === edge_value.data.source && 
            object_edges[j].data.target === edge_value.data.target) {
                edge_exists = true;
            }
        }

        if( !edge_exists ) {
            object_edges.push( edge_value );
        }
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

var property_number_nodes = document.getElementsByClassName("object_property_number");
var property_value_nodes = document.getElementsByClassName("object_property_value");


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

var cy = cytoscape({
    container: document.querySelector('#cy'),
  
    boxSelectionEnabled: false,
    autounselectify: true,
  
    style: cytoscape.stylesheet()
      .selector('node')
        .css({
          'content': 'data(name)',
          'text-valign': 'center',
          'color': 'white',
          'text-outline-width': 2,
          'background-color': '#000',
          'text-outline-color': '#000'
        })
      .selector('edge')
        .css({
          'curve-style': 'bezier',
          'label': 'data(label)',
          'target-arrow-shape': 'triangle',
          'target-arrow-color': '#000',
          'line-color': '#000',
          'width': 1,
          'color': 'white',
          'text-outline-width': 2,
          'background-color': '#000',
          'text-outline-color': '#000'
        })
      .selector('.multiline-auto')
        .css({
            "text-wrap": "wrap",
            "text-max-width": 80
        })
      .selector('.autorotate')
        .css({
            "edge-text-rotation": "autorotate"  
        })
      .selector('.edge-direction')
        .css({
            'width' : 3,
            'line-color': '#d3394c',
            'target-arrow-color': '#d3394c'
        })
      .selector('.faded')
        .css({
          'opacity': 0.25,
          'text-opacity': 0
        }),
  
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

var accordion_elements = document.getElementsByClassName("accordion");

for (var i = 0; i < accordion_elements.length; i++) {
    accordion_elements[i].onclick = function() {
        this.classList.toggle("active");
        var panel = this.nextElementSibling;

        if (panel.style.maxHeight) {
            panel.style.maxHeight = null;
        } else {
            panel.style.maxHeight = panel.scrollHeight + "px";
        } 
    }
}
