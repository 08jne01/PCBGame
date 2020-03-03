
let qtreeLayer0Player;
let qtreeLayer1Player;
let qtreeLayer0Level;
let qtreeLayer1Level;
let player;
let vias = [];
let tracks = [];
let startPad;
let endPad;
let editor = false;
let placeMode = 0;
let layer = 0;
let currentLevel = 0;
let paused = true;
function keyPressed()

{
	if (keyCode === 65 || keyCode === 37)

	{
		player.turnLeft();
	}

	if (keyCode === 68 || keyCode == 39)

	{
		player.turnRight();
	}

	if (keyCode === 32)

	{
		if (editor)
		{
			layer = layer == 0 ? 1 : 0;
			console.log("Layer " + layer);
			return;
		}

		if (paused)
		{
			paused = false;
			return;
		}
		

		if (player.m_layer)
		{
			player.space(qtreeLayer1Level,qtreeLayer1Player);
		}
		else
		{
			player.space(qtreeLayer0Level,qtreeLayer0Player);
		}
	}
	if (keyCode === 13)
	{
		placeMode++;
		placeMode = placeMode > 3 ? 0 : placeMode;
		switch (placeMode)
		{
			case 0:
				console.log("Mode: Via");
				break;
			case 1:
				console.log("Mode: Track");
				break;
			case 2:
				console.log("Mode: Start Pad");
				break;
			case 3:
				console.log("Mode: End Pad");
				break;
		}
	}

	if (keyCode === 90)
	{
		undo();
	}
	if (keyCode === 80)
	{
		printLayout();
	}
}

function undo()
{
	if (placeMode == 0)
	{
		vias.pop();
		console.log("undo");
	}
	else if (placeMode == 1)
	{
		tracks.pop();
		tracks.pop();
		console.log("undo");
	}
	else
	{
		console.log("just place new pad");
	}
	
}

function printLayout()
{
	let items = {
		vias : [],
		tracks : [],
		start : null,
		end : null
	};

	for (let i of vias)
	{
		items.vias.push([i.m_pos.x, i.m_pos.y]);
	}

	for (let i of tracks)
	{
		items.tracks.push({
			start : [i.m_start.x, i.m_start.y],
			end : [i.m_end.x, i.m_end.y],
			layer : i.m_layer
		});
	}

	items.start = [startPad.m_pos.x, startPad.m_pos.y, startPad.m_layer];
	items.end = [endPad.m_pos.x, endPad.m_pos.y, endPad.m_layer];

	console.log(JSON.stringify(items));
}

let prevX;
let prevY;
let creatingTrack = false;

function mouseClicked(event)
{
	if (editor == false)
	{
		return;
	}

	if (placeMode == 0)
	{
		creatingTrack = false;
		vias.push(new Via(mouseX, mouseY, layer));
	}
	else if (placeMode == 1)
	{
		if (creatingTrack)
		{
			if (abs(mouseX - prevX) > abs(mouseY - prevY))
			{
				let diff = -mouseY + prevY;
				//(mouseY - prevY) < 0 && 
				if ((mouseX - prevX) > 0)
				{
					diff = -diff;
				}

				if ((prevY - mouseY) < 0)
				{
					diff = -diff;
				}

				tracks.push(new Track(prevX, prevY, mouseX + diff, prevY, layer));
				tracks.push(new Track(mouseX + diff , prevY, mouseX, mouseY, layer));
				//tracks.push(new Track(prevX, prevY, mouseX, mouseY, layer));
			}
			else
			{
				let diff = -mouseX + prevX;
				if (mouseX - prevX > 0)
				{
					diff = -diff;
				}

				if ((prevY - mouseY) < 0)
				{
					diff = -diff;
				}
				tracks.push(new Track(prevX, prevY, prevX, mouseY + diff, layer));
				tracks.push(new Track(prevX, mouseY + diff, mouseX, mouseY, layer));
			}
			creatingTrack = false;
		}
		else
		{
			prevX = mouseX;
			prevY = mouseY;
			creatingTrack = true;
		}
	}
	else if (placeMode == 2)
	{
		creatingTrack = false;
		startPad = new Pad(mouseX, mouseY, layer);
	}
	else if (placeMode == 3)
	{
		creatingTrack = false;
		endPad = new Pad(mouseX, mouseY, layer);
	}
}

function level(level)
{
	qtreeLayer0Level = new QuadTree(new Boundary(width/2, height/2, width, height), 10);
	qtreeLayer1Level = new QuadTree(new Boundary(width/2, height/2, width, height), 10);
	for (let i of levels[level].vias)
	{
		vias.push(new Via(i[0], i[1], 0));
		qtreeLayer0Level.insert(new Point(i[0], i[1], 10.0));
		qtreeLayer1Level.insert(new Point(i[0], i[1], 10.0));
	}
	for (let i of levels[level].tracks)
	{
		//console.log(JSON.stringify(i));
		track = new Track(i.start[0], i.start[1], i.end[0], i.end[1], i.layer);
		track.addPointsToQuadTree(qtreeLayer0Level, qtreeLayer1Level);
		tracks.push(track);
	}

	startPad = new Pad(levels[level].start[0], levels[level].start[1], levels[level].start[2]);
	endPad = new Pad(levels[level].end[0], levels[level].end[1], levels[level].end[2]);

	endPad.addToQuadTree(qtreeLayer0Level, qtreeLayer1Level);
}

function setup()

{
	vias = [];
	tracks = [];
	startPad = null;
	endPad = null;
	createCanvas(600,600);

	level(currentLevel);
	player = new Player(startPad.m_pos.x, startPad.m_pos.y, startPad.m_layer);
	paused = true;
	//console.log(levels);
	

	//tracks.push(new Track(100, 100, 200, 200, 1));
}

function draw()

{
	background(0,150,0);
	if (editor)
	{
		for (let i of tracks)
		{
			i.draw(layer);
		}
		for (let i of vias)
		{
			i.draw(layer);
		}	
		startPad.draw(layer);
		endPad.draw(layer);
		return;
	}

	qtreeLayer0Player = new QuadTree(new Boundary(width/2, height/2, width, height), 10);
	qtreeLayer1Player = new QuadTree(new Boundary(width/2, height/2, width, height), 10);

	for (let i = 0; i < player.m_points.length - 10; i++)
	{
		let j  = player.m_points[i];
		if (j.data)
		{
			qtreeLayer1Player.insert(new Point(j.x, j.y, player.m_radius));
		}
		else
		{
			qtreeLayer0Player.insert(new Point(j.x, j.y, player.m_radius));
		}
	}

	for (let i = 0; i < player.m_vias.length; i++)
	{
		via = player.m_vias[i];
		if (via.m_activated)
		{
			if (player.m_layer)
			{
				qtreeLayer1Player.insert(new Point(via.m_pos.x, via.m_pos.y, via.m_radius));
			}
			else
			{
				qtreeLayer0Player.insert(new Point(via.m_pos.x, via.m_pos.y, via.m_radius));
			}
		}
	}

	if (!paused)
	{
		if (player.m_layer)
		{
			player.update(qtreeLayer1Level,qtreeLayer1Player);
		}
		else
		{
			player.update(qtreeLayer0Level,qtreeLayer0Player);
		}
	}
	
	for (let i of tracks)
	{
		i.draw(player.m_layer);
	}

	for (let i of vias)
	{
		i.draw(player.m_layer);
	}	

	startPad.draw(player.m_layer);
	endPad.draw(player.m_layer);
	
	player.draw();

	
	if (paused)
	{
		noStroke();
		textSize(40);
		fill(240, 230, 140);
		text("Space to change layer", 10, height - 40);
	}
}