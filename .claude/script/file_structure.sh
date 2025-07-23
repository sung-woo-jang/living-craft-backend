#!/bin/bash
tree -I "node_modules|public|dist" | sed 's/[  ]*//g' > file_structure.txt