var diameter = 1000;
  var svg = d3.select('#chart').append('svg')
    .attr('width', diameter)
    .attr('height', diameter);

  var bubble = d3.pack()
    .size([diameter, diameter])
    // .value(function(d) {return d.size;}) // new data is loaded to bubble layout
    .padding(1);

  // var color = d3.scale.category20();
  var color = d3.scaleOrdinal(d3.schemeCategory20c);
  var duration = 200;

  function drawBubbles(data) {
    // console.log('draw chart');

    var root = d3.hierarchy(data)
      .sum(function(d) { return d.value; });

    // console.log(nodes);

    // assign new data to existing DOM 
    var vis = svg.selectAll('circle')      
      .data(bubble(root).leaves());
    
    var delay = 0;

    // update - this is created before enter.append. it only applies to updating nodes.
    vis.transition()
      .duration(duration)
      .delay(function(d, i) {delay = i * 7; return delay;}) 
      .attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; })
      .attr('r', function(d, i) {        
        return d.r; })
      .style('opacity', 1); // force to 1, so they don't get stuck below 1 at enter()

    // enter - only applies to incoming elements (once emptying data) 
    vis.enter().append('circle')
      .attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; })
      .attr('r', function(d) { return 0; })
      .attr('class', function(d) { return d.className; })
      .style("fill", function(d, i) { return color(i); })
      .transition()
      .duration(duration * 1.2)
      .attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; })
      .attr('r', function(d) { return d.r; })
      .style('opacity', 1);

    // exit
    vis.exit()
      .transition()
      .duration(duration)
      .attr('transform', function(d) { 
        var dy = d.y - diameter/2;
        var dx = d.x - diameter/2;
        var theta = Math.atan2(dy,dx);
        var destX = diameter * (1 + Math.cos(theta) )/ 2;
        var destY = diameter * (1 + Math.sin(theta) )/ 2; 
        return 'translate(' + destX + ',' + destY + ')'; })
      .attr('r', function(d) { return 0; })
      .remove();
  }

  function processData(data) {
    if(!data) return;

    allText = allText.replace(/,/g, ' ');
    allText = allText.replace(/\r?\n|\r/g, ' ');
    allText = allText.replace(/;/g, ' ');
    allText = allText.replace(/-/g, ' ');
    allText = allText.replace(/\./g, ' ');
    // console.log(allText);

    words = allText.split(' ');
    words = words.filter(function(elem, index, array) {                                   
            return elem != "";
        }
    );
    
    len = words.length;
    tick();
  }

  var loop = 0;  
  var len;   
  var tmpArray = [];
  function tick() {
    if(loop < len) {      
      
      let tmp = words[loop].toLowerCase();
      let idx;

      if((idx = tmpArray.indexOf(tmp)) == -1) {
        uniqueWords.push({name: tmp, value: 1});
        tmpArray.push(tmp);        

      } else {
        console.log('duplicate');
        // if(uniqueWords[idx].value < 50) {
          uniqueWords[idx].value += 1;  
        // }
        
      }
      // console.log(uniqueWords[loop]);       
      drawBubbles({children: uniqueWords}); 
      ++loop;

      setTimeout(tick, duration);
    } else {
      console.log(uniqueWords);
      
    }
      
  }

  // getData();

  function loadTxtFile() {
    var txtFile = new XMLHttpRequest();
    txtFile.open("GET", "sample.txt", true);
    txtFile.onreadystatechange = function() {
      if (txtFile.readyState === 4) {  // Makes sure the document is ready to parse.
        if (txtFile.status === 200) {  // Makes sure it's found the file.
          allText = txtFile.responseText;
          // lines = txtFile.responseText.split("\n"); // Will separate each line into an array
          // console.log(allText);
          processData(allText);
        }
      }
    }
   
    txtFile.send(null);
   
  }


  var allText, words;
  var uniqueWords = [];
  loadTxtFile();


  