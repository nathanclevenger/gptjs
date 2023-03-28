#!/usr/bin/env node


import fs from 'fs'
import figlet from 'figlet'
import inquirer from 'inquirer'
import { Command } from 'commander'
import gradient from 'gradient-string'
import chalkAnimation from 'chalk-animation'


const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'))

const program = new Command()

let args = { }
const updateArgs = updatedArgs => args = { ...args, ...updatedArgs }

const rainbowTitle = chalkAnimation.rainbow('GPT Code Generator\n')

program
  .name(pkg.name)
  .description(pkg.description)
  .version(pkg.version)
