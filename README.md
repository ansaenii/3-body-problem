# Cosmic 3-Body Problem Simulation

A beautiful, interactive 3D simulation of the three-body problem in celestial mechanics, featuring stunning visual effects and real-time physics.

## Quick Launch

### Option 1: Windows Batch File (Recommended)
1. Double-click `launch.bat`
2. The simulation will automatically open in your default browser
3. To stop the server, press `Ctrl+C` in the command window

### Option 2: PowerShell Script
1. Right-click `launch.ps1` and select "Run with PowerShell"
2. The simulation will automatically open in your default browser
3. To stop the server, press `Ctrl+C` in the PowerShell window

## Requirements

- **Python 3.x** (for the local server)
  - Download from: https://python.org
  - Make sure to check "Add Python to PATH" during installation

## Features

- **Interactive Controls**: Adjust time scale, trail length, particle density, and glow intensity
- **Preset Configurations**: Figure-8, Lagrange, Chaos, and Orbit patterns
- **Real-time Physics**: Accurate gravitational calculations with energy conservation
- **Stunning Visuals**: Particle systems, trail rendering, lighting effects, and post-processing
- **Performance Monitoring**: Real-time GPU, CPU, and memory usage tracking
- **Screenshot Capture**: Save beautiful moments from the simulation

## Manual Launch (Alternative)

If the launcher scripts don't work, you can manually start the server:

1. Open Command Prompt or PowerShell
2. Navigate to this folder: `cd C:\Users\yyang\3-body-problem`
3. Run: `python -m http.server 8000`
4. Open your browser and go to: `http://localhost:8000`

## Troubleshooting

- **"Python is not installed"**: Install Python from https://python.org
- **"index.html not found"**: Make sure you're running the script from the correct folder
- **Browser doesn't open**: Manually navigate to `http://localhost:8000`
- **Port 8000 in use**: The script will show an error; try a different port manually

## Controls

- **Time Scale**: Speed up or slow down the simulation
- **Trail Length**: Adjust the length of particle trails
- **Particle Density**: Control the number of visual particles
- **Glow Intensity**: Adjust the brightness of particle effects
- **Reset**: Restart the simulation with current settings
- **Pause**: Pause/resume the simulation
- **Screenshot**: Capture the current view

Enjoy exploring the fascinating world of celestial mechanics! 🌌
