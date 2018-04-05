
  var svg = d3.select('#chart').append('svg')
    .attr('width', 1500)
    .attr('height', 1000);

  var color = d3.scale.category20();  
  var duration = 3000;

  var padding = 1,
    maxRadius = 3;



  function drawBubbles(nodes) {
    // console.log('draw chart');
    // var force = d3.layout.force()
    //     .nodes(nodes)
    //     .size([1500, 1000])
    //     // .links([])
    //     .gravity(0)
    //     .charge(0)
    //     .friction(.9)
    //     .on("tick", tick)
    //     .start();
    

    var circle = svg.selectAll("circle")
        .data(nodes)
      .enter().append("circle")
        .attr("r", function(d) { return 5 * d.radius; });
        // .style("fill", function(d) { return d.color; });

    // console.log(nodes);
    
    var delay = 0;

    // update - this is created before enter.append. it only applies to updating nodes.
    circle.transition()
      .duration(duration)
      .delay(function(d, i) {delay = i * 7; return delay;}) 
      .attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; })
      .attr('r', function(d, i) {        
        return 5 * d.radius; })
      .style('opacity', 1); // force to 1, so they don't get stuck below 1 at enter()

    // enter - only applies to incoming elements (once emptying data) 
    // circle.enter().append('circle')
    //   .attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; })
    //   .attr('r', function(d) { return 0; })
    //   .attr('class', function(d) { return d.className; })
    //   .style("fill", function(d, i) { return color(i); })
    //   .transition()
    //   .duration(duration * 1.2)
    //   .attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; })
    //   .attr('r', function(d) { return 5 * d.value; })
    //   .style('opacity', 1);
    
    // force.resume();

    function tick(e) {
      var k = 0.04 * e.alpha;
  
      // Push nodes toward their designated focus.
      nodes.forEach(function(o, i) {
        var curr_act = o.act;
        
        // Make sleep more sluggish moving.
        if (curr_act == "0") {
            var damper = 0.6;
        } else {
            var damper = 1;
        }
        // o.color = color(curr_act);
        o.y += (o.y - o.y) * k * damper;
        o.x += (o.x - o.x) * k * damper;
      });

      circle
          .each(collide(.5))
          // .style("fill", function(d) { return d.color; })
          .attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; });
    }

    function collide(alpha) {
      var quadtree = d3.geom.quadtree(nodes);
      return function(d) {
        var r = d.radius + maxRadius + padding,
            nx1 = d.x - r,
            nx2 = d.x + r,
            ny1 = d.y - r,
            ny2 = d.y + r;
        quadtree.visit(function(quad, x1, y1, x2, y2) {
          if (quad.point && (quad.point !== d)) {
            var x = d.x - quad.point.x,
                y = d.y - quad.point.y,
                l = Math.sqrt(x * x + y * y),
                r = d.radius + quad.point.radius + (d.act !== quad.point.act) * padding;
            if (l < r) {
              l = (l - r) / l * alpha;
              d.x -= x *= l;
              d.y -= y *= l;
              quad.point.x += x;
              quad.point.y += y;
            }
          }
          return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
        });
      };
    }
  }




    // Resolve collisions between nodes.
    

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
    





    // console.log(uniqueWords);
    len = words.length;
    tick();
  }

  var loop = 0;  
  var len;   
  var tmpArray = [];
  var cluster = 0;
  function tick() {
      for(let i=0; i < 10; ++i) {
        if(loop < len) {      
        
          let tmp = words[loop].toLowerCase();
          let idx;

          if((idx = tmpArray.indexOf(tmp)) == -1) {
            uniqueWords.push({name: tmp, radius: 1, x: 1500 * Math.random(), y: 800 * Math.random()});
            tmpArray.push(tmp);        

          } else {
            // console.log('duplicate');
            // if(uniqueWords[idx].value < 50) {
              uniqueWords[idx].radius += 1;  
            // }
            
          }
          // console.log(uniqueWords[loop]);       
          
          ++loop;
          ++cluster;
        } else {
          console.log(uniqueWords);  
          break;
        } 
        
      }
      
      if(cluster > 0) {
        drawBubbles(uniqueWords);    
        setTimeout(tick, duration);
      }
      
      cluster = 0;
      
  }

  // getData();

  function loadTxtFile() {
    var txtFile = new XMLHttpRequest();
    txtFile.open("GET", "sam.txt", true);
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


  