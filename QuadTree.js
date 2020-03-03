class QuadTree

{
	constructor(boundary, capacityLocal)

	{
		this.capacity = capacityLocal;
		this.boundary = boundary;
		this.northwest = null;
		this.northeast = null;
		this.southwest = null;
		this.southeast = null;

		this.points = [];
		this.divided = 0;
	}

	query(output, range)
	{
		if (!this.boundary.intersects(range))
		{
			return;
		}
		else if (!this.divided)
		{
			for (let point of this.points)
			{
				if (range.contains(point))
				{
					output.push(point);
				}
			}
		}
		else if (this.divided)
		{
			this.northwest.query(output, range);
			this.northeast.query(output, range);
			this.southwest.query(output, range);
			this.southeast.query(output, range);
		}
	}

	subDivide()
	{
		let x = this.boundary.x;
		let y = this.boundary.y;
		let w = this.boundary.w;
		let h = this.boundary.h;

		let nw = new Boundary(x - w/4, y - h/4, w/2, h/2);
		let ne = new Boundary(x + w/4, y - h/4, w/2, h/2);
		let sw = new Boundary(x - w/4, y + h/4, w/2, h/2);
		let se = new Boundary(x + w/4, y + h/4, w/2, h/2);

		this.northwest = new QuadTree(nw, this.capacity);
		this.northeast = new QuadTree(ne, this.capacity);
		this.southwest = new QuadTree(sw, this.capacity);
		this.southeast = new QuadTree(se, this.capacity);

		for (let point of this.points)
		{
			this.northwest.insert(point);
			this.northeast.insert(point);
			this.southwest.insert(point);
			this.southeast.insert(point);
		}
		this.points.length = 0;
		this.divided = 1;
	}

	insert(point)
	{
		if (!this.boundary.contains(point))
		{
			return;
		}

		if (this.points.length < this.capacity && !this.divided)
		{
			this.points.push(point);
		}
		else if (!this.divided)
		{
			this.subDivide();
		}

		if (this.divided)
		{
			this.northwest.insert(point);
			this.northeast.insert(point);
			this.southwest.insert(point);
			this.southeast.insert(point);
		}

	}

	draw()
	{
		if (this.divided)
		{
			this.northwest.draw();
			this.northeast.draw();
			this.southwest.draw();
			this.southeast.draw();
		}

		strokeWeight(1);
		stroke(255);
		noFill();
		rectMode(CENTER);
		rect(this.boundary.x, this.boundary.y, this.boundary.w, this.boundary.h);

		for (let i of this.points)
		{
			point(i.x, i.y);
		}
	}
}