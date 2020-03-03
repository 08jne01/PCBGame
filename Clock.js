class Clock

{
	constructor()

	{
		this.timer = 0;
	}

	reset()

	{
		this.timer = millis();
	}

	time()

	{
		return millis() - this.timer;
	}
}