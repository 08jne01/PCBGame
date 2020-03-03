var ItemType = {
    VIA: 0,
    TRACK: 1
};

var viaSize = 10.0;
var playerSize = 5.0;

class Via
{
    constructor(x, y, layer)
    {
        this.m_pos = createVector(x, y);
        this.m_layer = layer;
        this.m_radius = viaSize;
        this.m_diameter = this.m_radius*2.0;
        this.m_activated = false;
    }

    draw(layer)
    {
        strokeWeight(5.0);
        layer == 0 ? stroke(255,0,0) : stroke(0,0,255);
        fill(255);
        //point(this.m_pos.x, this.m_pos.y);
        ellipse(this.m_pos.x, this.m_pos.y, this.m_diameter, this.m_diameter);
    }
}

class Pad
{
    constructor(x, y, layer)
    {
        this.m_pos = createVector(x, y);
        this.m_layer = layer;
        this.m_radius = viaSize*1.5;
        this.m_diameter = this.m_radius*2.0;
    }
    draw(layer)
    {
        strokeWeight(0.0);
        let alpha = this.m_layer == layer ? 255 : 90;
        this.m_layer == 0 ? fill(255,0,0, alpha) : fill(0,0,255, alpha);
        //fill(255);
        //point(this.m_pos.x, this.m_pos.y);
        ellipse(this.m_pos.x, this.m_pos.y, this.m_diameter, this.m_diameter);
    }
    addToQuadTree(qTree0, qTree1)
    {
        if (this.m_layer)
        {
            qTree1.insert(new Point(this.m_pos.x, this.m_pos.y, this.m_radius/2.0));
        }
        else
        {
            qTree0.insert(new Point(this.m_pos.x, this.m_pos.y, this.m_radius/2.0));
        }
    }
}

class Track
{
    constructor(x1, y1, x2, y2, layer)
    {
        this.m_start = createVector(x1, y1);
        this.m_end = createVector(x2, y2);
        this.m_layer = layer;
        this.m_points = [];

        let step = playerSize/2.0;
        let number = dist(this.m_start.x, this.m_start.y, this.m_end.x, this.m_end.y) / step;
        number = floor(number);

        let dir = p5.Vector.sub(this.m_end, this.m_start);
        dir.setMag(step);

        this.m_points.push(new Point(this.m_start.x, this.m_start.y, playerSize));
        this.m_points.push(new Point(this.m_end.x, this.m_end.y, playerSize));

        let p = createVector(this.m_start.x, this.m_start.y);

        for (let i = 1; i < number; i++)
        {
            p.add(dir);
            this.m_points.push(new Point(p.x, p.y, playerSize));
        }
    }

    addPointsToQuadTree(qTree0, qTree1)
    {
        if (this.m_layer)
        {
            for (let i of this.m_points)
            {
                qTree1.insert(i);
            }
        }
        else
        {
            for (let i of this.m_points)
            {
                qTree0.insert(i);
            }
        }
        
        this.m_points = [];
    }

    draw(layer)
    {
        let alpha = this.m_layer == layer ? 255 : 90;
        strokeWeight(2.0*playerSize);
        this.m_layer ? stroke(0,0,255, alpha) : stroke(255,0,0, alpha);
        line(this.m_start.x, this.m_start.y, this.m_end.x, this.m_end.y);
    }
}

var Direction = {

}

class Player
{
    constructor(x, y, layer)
    {
        this.m_pos = createVector(x,y);
        this.m_prev = createVector(x, y);
        this.m_dir = 0;
        this.m_radius = playerSize;
        this.m_diameter = this.m_radius*2.0;
        this.m_points = [];
        this.m_vias = [];
        this.m_layer = layer;
        this.m_alive = true;
        this.m_speed = 1.3;
        this.m_length = -1.0;
    }

    draw()
    {
        stroke(255,0,0);
        //fill(255);
        strokeWeight(this.m_diameter);
        let alpha = 255;
		for (let i = 1; i < this.m_points.length; i++)
		{
            alpha = this.m_layer == this.m_points[i].data ? 255 : 20;
			this.m_points[i].data == 0 ? stroke(255,0,0, alpha) : stroke(0,0,255, alpha);
			line(this.m_points[i-1].x, this.m_points[i-1].y, this.m_points[i].x ,this.m_points[i].y);
			//point(this.points[i].x, this.points[i].y);
		}
        point(this.m_pos.x, this.m_pos.y);
        point(this.m_prev.x, this.m_prev.y);

        for (let i = 0; i < this.m_vias.length; i++)
        {
            this.m_vias[i].draw(this.m_layer);
        }

        if (!this.m_alive)
        {
            noStroke();
		    textSize(40);
            fill(240, 230, 140);
            if (dist(endPad.m_pos.x, endPad.m_pos.y, this.m_pos.x, this.m_pos.y) < endPad.m_radius && this.m_layer == endPad.m_layer)
            {
                if (this.m_length < 0.0)
                {
                    this.calcLength();
                }
                text("Good job! Route Length: " + floor(this.m_length/10.0) + ".\nSpace for next level.", 10, height - 80);
            }
            else
            {
                text("Space to restart.", 10, height - 40);
            }
		   
        }

        //line(this.m_pos.x, this.m_pos.y, this.m_prev.x, this.m_prev.y);
    }

    calcLength()
    {
        this.m_length = 0.0;
        for (let i = 1; i < this.m_points.length; i++)
        {
            this.m_length += dist(this.m_points[i-1].x, this.m_points[i-1].y, this.m_points[i].x, this.m_points[i].y);
        }
    }

    turnLeft()
    {
        this.m_dir--;
        this.m_dir = this.m_dir < 0 ? 7 : this.m_dir;
    }

    turnRight()
    {
        this.m_dir++;
        this.m_dir = this.m_dir > 7 ? 0 : this.m_dir;
    }

    reset(x, y, layer)
    {
        this.m_vias = [];
        this.m_points = [];
        this.m_pos = createVector(x, y);
        this.m_prev = createVector(x, y);
        this.m_dir = 0;
        this.m_alive = true;
        this.m_layer = layer;
        this.m_length = -1.0;
    }

    space(qtreeLevel, qtreePlayer)
    {
        if (this.m_alive == false)
        {
            if (dist(endPad.m_pos.x, endPad.m_pos.y, this.m_pos.x, this.m_pos.y) < endPad.m_radius  && this.m_layer == endPad.m_layer)
            {
                currentLevel++;
                setup();
            }
            else
            {
                this.reset(startPad.m_pos.x, startPad.m_pos.y, startPad.m_layer);
            }   
        }
        else if ((this.m_vias.length > 0 && this.m_vias[this.m_vias.length-1].m_activated) || this.m_vias.length == 0)
        {
            if (this.checkCollision(qtreeLevel, qtreePlayer, viaSize*1.2))
            {
                this.m_vias.push(new Via(this.m_pos.x, this.m_pos.y, 0));
                this.m_layer = this.m_layer == 0 ?  1 : 0;
            }
        }
    }

    checkCollision(qtreeLevel, qtreePlayer, radius)
    {
        let found = [];
 		qtreePlayer.query(found, new Boundary(this.m_pos.x, this.m_pos.y, 1.0, 1.0, 50.0));
    	for (let i = 0; i < found.length && !this.safe; i++)  

    	{
				
			if (dist(found[i].x, found[i].y, this.m_pos.x, this.m_pos.y)  < (found[i].data + radius))

			{
                //this.reset(random(width), random(height));
                return false;
			}
        }

        found = [];
 		qtreeLevel.query(found, new Boundary(this.m_pos.x, this.m_pos.y, 1.0, 1.0, 50.0));
    	for (let i = 0; i < found.length && !this.safe; i++)  

    	{
				
			if (dist(found[i].x, found[i].y, this.m_pos.x, this.m_pos.y)  < (found[i].data + radius))

			{
                //this.reset(random(width), random(height));
                return false;
			}
        }
        return true;
    }

    update(qtreeLevel, qtreePlayer)
    {
        if (this.m_alive == false)
        {
            return;
        }
        this.m_alive = this.checkCollision(qtreeLevel, qtreePlayer, this.m_radius);
        this.edges();
        let vel = createVector(1,0);
        vel.rotate(radians(45.0*this.m_dir));
        vel.setMag(this.m_speed);

        if (dist(this.m_prev.x, this.m_prev.y, this.m_pos.x, this.m_pos.y) > this.m_radius/2.0)
        {
            this.m_prev = createVector(this.m_pos.x, this.m_pos.y);
            this.m_points.push(new Point(this.m_pos.x, this.m_pos.y, this.m_layer));
        }

        if (this.m_vias.length > 0 && this.m_vias[this.m_vias.length-1].m_activated == false)
        {
            let via = this.m_vias[this.m_vias.length-1];
            this.m_vias[this.m_vias.length-1].m_activated = dist(via.m_pos.x, via.m_pos.y, this.m_pos.x, this.m_pos.y) > (this.m_radius + via.m_radius) ? true : false;
        }

        //this.m_prev = (dist(this.m_prev.x, this.m_prev.y, this.m_pos.x, this.m_pos.y) > this.m_diameter) ? createVector(this.m_pos.x, this.m_pos.y) : this.m_prev;
        this.m_pos.add(vel);
    }

    edges()
    {
        if (this.m_pos.x + this.m_radius > width)
        {
            this.m_pos.x = width - this.m_radius;
            if (this.m_dir == 7)
            {
                this.m_dir = 6;
            }
            else if (this.m_dir == 1)
            {
                this.m_dir = 2;
            }
            else if (this.m_dir == 0)
            {
                this.m_dir = this.m_pos.y >= height/2 ? 6 : 2;
            }
        }

        if (this.m_pos.y + this.m_radius > height)
        {
            this.m_pos.y = height - this.m_radius;
            if (this.m_dir == 1)
            {
                this.m_dir = 0;
            }
            else if (this.m_dir == 3)
            {
                this.m_dir = 4;
            }
            else if (this.m_dir = 2)
            {
                this.m_dir = this.m_pos.x >= width/2 ? 4 : 0;
            }
        }

        if (this.m_pos.x - this.m_radius < 0)
        {
            this.m_pos.x = this.m_radius;
            if (this.m_dir == 3)
            {
                this.m_dir = 2;
            }
            else if (this.m_dir == 5)
            {
                this.m_dir = 6;
            }
            else if (this.m_dir = 4)
            {
                this.m_dir = this.m_pos.y >= height/2 ? 6 : 2;
            }
        }

        if (this.m_pos.y - this.m_radius < 0)
        {
            this.m_pos.y = this.m_radius;
            if (this.m_dir == 5)
            {
                this.m_dir = 4;
            }
            else if (this.m_dir == 7)
            {
                this.m_dir = 0;
            }
            else if (this.m_dir == 6)
            {
                this.m_dir = this.m_pos.x >= width/2 ? 4 : 0;
            }
        }
    }
}