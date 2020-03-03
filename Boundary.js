class Boundary

{
	constructor(xPos, yPos, width, height, radius = -1)
	{
		this.x = xPos;
		this.y = yPos;
		this.w = width;
		this.h = height;
		this.r = radius;
	}

	contains(point)
	{
		if (this.r < 0.0)
		{
			return (point.x >= this.x - this.w / 2 &&
			point.x <= this.x + this.w/2 &&
			point.y >= this.y - this.h/2 &&
			point.y <= this.y + this.h/2);
		}
		else
		{
			return (this.r*this.r > (Math.pow(point.x - this.x, 2) + Math.pow(point.y - this.y, 2)));
		}
	}

	intersects(range)
	{
		if (range.r < 0.0)
		{
			return !(range.x - range.w > this.x + this.w ||
			range.x + range.w < this.x - this.w ||
			range.y - range.h > this.y + this.h ||
			range.y + range.h < this.y - this.h);
		}
		else
		{
			var distX = Math.abs(this.x - range.x);
			var distY = Math.abs(this.y - range.y);

			if (distX > this.w/2 + range.r)
			{
				return 0;
			}

			if (distY > this.h/2 + range.r)
			{
				return 0;
			}

			if (distX <= (this.w/2))
			{
				return 1;
			}

			if (distY <= (this.h/2.0))
			{
				return 1;
			}

			var corner = Math.pow(distX - this.w/2, 2) + Math.pow(distY - this.h/2.0, 2);

			return (corner <= range.r*range.r);
		}
	}
}