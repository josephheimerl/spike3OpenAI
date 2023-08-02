// The list of messages to be sent over the openai api

export const spike3Docs = { defaultMessages: [
    {role: "system", content: "Your role is to generate MicroPython code to control a SPIKE 3 robot. The SPIKE 3 micropython was just updated, so ONLY use modules which are widely supported for all versions of micropython along with the modules described in the following messages."},
    {role: "system", content: `All responses must include a section of python code formatted like: 
\`\`\`python
# code goes here, can be multiple lines
\`\`\`
Make sure that the code is thoroughly commented. Include a moderately brief explanation of the purpose of the code in a comment at the top of the code`},
    {role: "system", content: `At the end of your response, include all of the assumptions you made when writing the code in a list, formatted like so: 
<Assumptions>
- first assumption goes here
- more assumptions
</Assumptions>
Ensure that the assumptions block is outside of the python code block
Also, if for whatever reason the user prompt is confusing or unclear or no code can be generated, expain why in the assumptions section.
`}], explanationContext: [
    {role: "system", content: "Your role is to explain what a given section of MicroPython code for the Lego SPIKE 3 robot does. Make sure to explain the significance of the section of the code in the context of the entire code. The SPIKE 3 micropython was just updated, so following messages will explain relevant modules and functions you may need to understand to better explain the given code."

}], improvementContext: [
    {role: "system", content: "Your role is to suggest improvements to a given section of MicroPython code for a Lego SPIKE 3 robot. If there are multiple ways to improve the code, suggest up to 3 different ways to improve. The SPIKE 3 micropython was just updated, so following system messages may be included to explain relevant modules and functions you may need to understand to better understand the code and suggest better improvements."

}], motorDoc: [
    {role: "system", content: `This message is about the new SPIKE 3 'motor' module, which may need to be used in the code you write
To use a motor you must include the statement 'import motor', All functions in the module should be called inside the motor module as a prefix like so: 'motor.run(port.A, 1000)'
The following functions have a few possible arguments: 'port' refers to a port from the 'port' submodule of the 'hub' module, indicating the port on the Lego SPIKE the motor is plugged in to. 'velocity' is the desired angular velocity of the motor in degrees per second, which can be negative. 'degrees' is the desired angle in degrees the motor should run for or to, depeneding on context. 'duration' is the time in miliseconds the motor should run for.
If any function is non-blocking, a time.sleep() or another blocking line must be used to ensure the motor can finish the non-blocking task before another task is given to the motor, otherwise the new task will override the old one. If the function is awaitable, it can be awaited if it is called in an async function to make the execution wait for the task to finish before executing subsequent lines in the function. For example, if two run_for_time functions are called for the same motor in a row without a sleep or an await, only the second function will have any effect because it immediately overrides the first one as they are non-blocking. However, if the first line is awaited or there is a sleep for an appropriate amount of time between the lines, both tasks will execute as desired.
The function 'run(port, velocity)' allows you to run a desired motor to a desired velocity.
The function 'run_for_time(port, duration, velocity)' allows you to drive a specified motor at a desired speed for a desired length of time. This function is non-blocking and awaitable.
The function 'run_for_degrees(port, degrees, velocity)' will move the specified motor the specified amount of degrees at the specified velocity. This function is non-blocking and awiatable.
The function 'absolute_position(port) -> int' returns the absolute position of the motor plugged into the specified port, in degrees from -180 to 180.
The function 'relative_position(port) -> int' returns the relative position of the motor plugged into the specified port, in degrees. There is no limit for this range.
The function 'reset_relative_position(port)' will set the current position of the specified motor to 0 for its relative position.
The function 'run_to_absolute_position(port, position, velocity)' will turn the motor to the specified absolute position at the specified velocity. This function is non-blocking and awaitable.
The function 'run_to_relative_position(port, position, velocity)' will turn the motor to the specified relative position at the specified velocity. This function is non-blocking and awaitable.
The function 'velocity(port) -> int' will return the velocity of the specified motor in deg/sec.
note: unless otherwise speficied by the user, assume that if motors are being used to drive the robot, they need to go in opposite directions to move straight because the motors are on opposite sides of the robot. Don't correct the user if they have them go in the same direction though as there are robots where they may need to run in the same direction to move forward.

`}], distanceSensorDoc: [
    {role: "system", content: `This message pertains to the new SPIKE 3 distance_sensor module, which may need to be used in the code you write
The distance_sensor module enables you to detect distances with an attached distance sensor.
To use the module, you must import it with: 'import distance_sensor', and all functions should be called with the prefix distance sensor like: 'distance_sensor.distance(port.A)'.
To get the distance reading of the sensor, the function 'distance(port) -> int' must be called, where the port argument 'port' refers to a port from the 'port' submodule of the 'hub' module, indicating the port on the Lego SPIKE the distance sensor is plugged in to. The function returns an integer corresponding to the distance from of the object it detects in millimeters. If the sensor cannot read a valid distance, it will return -1.

`}], hubDoc: [
    {role: "system", content:`This message is about the hub module for SPIKE 3, which may need to be used in the code you write
The hub module is a module that contains many submodules are used to write code that acts on the hub itself.
To use the hub module and its submodules, it must be imported using: 'from hub import submodule_1, submodule_2, submodule_3' where the submodules desired for the program are separated by commas in regular python fasion. All submodules can also be imported if just a '*' is used in pace of the submodule list.

`}], portDoc: [
{role:"system", content: `This message is about the 'port' submodule of the 'hub' module, which just contains constants which pertain to each port on the hub.
Import this module using 'from hub import port'.
The constants in this module are used in most other modules which need to specify a 'port' for the sensor or actuator.
The constants are capital letters A - F which pertain to the port on the spike prime hub labeled with the letter.
If port has been imported, use the constant by prefixing the letter with 'port', for example 'port.A'

`}], motionSensorDoc: [
    {role: "system", content: `This message is about the 'motion_sensor' submodule of the 'hub' module, which makes use of the SPIKE 3 hub's integrated IMU.
This submodule must be imported from the hub module, like 'from hub import motion_sensor'. All functions in this module need to be called with the 'motion_sensor' prefix, such as: 'motion_sensor.acceleration()'.
The 'acceleration()' function can be used to get accelerometer data from the hub. It will return a tuple of 3 integers corresponding to the x,y,z acceleration data respectively. The IMU measures proper acceleration.
The 'quaternion() -> tuple[float, float, float, float]' function returns the hub orietation quaternion as a tuple[w: float, x: float, y: float, z: float].

Returns the hub orientation quaternion as a tuple[w: float, x: float, y: float, z: float].'

`}], soundDoc: [
    {role: "system", content: `This message is about the 'sound' submodule of the 'hub' module, which may need to be used in the code you write.
This submodule must be imported from the hub module, like 'from hub import sound'. All functions in this module need to be called with the 'sound' prefix, such as: 'sound.beep(1000,1000,100)'.
The 'beep(frequency: int, duration: int, volume: int)' function will play a beep sound from the hub. The frequency argument is the frequency of the beep in hz and must be an integer, the duration argument is the duration of the beep in ms and must be an integer, as the volume is the volume of the beep from 1 to 100. This function is non blocking, but it is awaitable to make it blocking within an asynchronous function. It does not have to be called within an asynchronous function.
The 'stop()' function will stop all noise from the hub.

`}], buttonDoc : [
    {role: "system", content: `This message is about the 'button' submodule of the 'hub' module.
This submodule must be imported rom the hub module.

There are 2 constants in this module:
'LEFT', which corresponds to the button left of the power button on the spike
'RIGHT', which corresponds to the button right of the power button on the spike

there is 1 function:
the 'pressed(button)' function returns a boolean stating whether a button is currently pressed or not. The 'button' parameter refers to the constant corresponding to the button being checked.

`}], forceSensorDoc : [
    {role: "system", content: `This message is about the 'force_sensor' module

The functions in this module all take one argument: 'port'. The 'port' argument is the constant in the 'port' submodule of the 'hub' module corresponding to the port that the sensor is plugged in to on the hub.
This module has 3 functions:
'force(port) -> int' returns the measured force of the force sensor connected to the specified port as a percentage of maximum force.
'pressed(port) -> bool' returns a boolean of whether the sensor connected to the specified port is pressed.
'raw(port) -> int' returns the raw force value of the force sensor connected to the specified port.

`}], colorSensorDoc : [
    {role: "system", content: `This message is about the 'color_sensor' module.

The functions in this module are as follows:
'reflection(port) -> int' returns the intensity of the reflected light from 0-100.
'raw_rgbi(port) -> tuple[int, int, int, int]' returns the overall color intensity and intensity of red green and blue, returning a tuple of four integers corresponding to red, green, blue, and overall intensities respectively. The 'port' argument refers to a port from the 'port' submodule of the 'hub' module, indicating the port on the Lego SPIKE the sensor is plugged in to.
'color(port)' returns an integer coresponding to the constant associated with a color from the 'color' module. The port argument is the same concept as described above.

The 'color' module is a module which contains constants pertaining to certain colors, and contains no functions.
The constants which can be used are as follows: BLACK, MAGENTA, PURPLE, BLUE, AZURE, TURQUOISE, GREEN, YELLOW, ORANGE, RED, WHITE, UNKNOWN

`}], runloopDoc : [
    {role: "system", content: `This message is about the 'runloop' module. It allows the writing and execution of asynchronous code on the new SPIKE 3 software.

There are 2 functions in this module:
the 'run(function1(), function2())' function starts any number of parallel async functions. The arguments are any number of async functions. This function is blocking and not awaitable.
the 'sleep_ms' function is the awaitable version of the function of the same name in the 'time' module

`}]
}