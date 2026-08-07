<#
.SYNOPSIS
  Refresh the graphify knowledge graph for this project.

.DESCRIPTION
  Incrementally re-extracts code files (AST only, no LLM/API key needed) and
  rebuilds graph.json, graph.html, and GRAPH_REPORT.md in graphify-out/.

  For changes to docs/papers/images (semantic extraction), run
  `/graphify . --update` inside Claude Code instead - that path dispatches
  subagents to re-read the changed non-code files.

.PARAMETER Force
  Pass to overwrite graph.json even if the rebuild has fewer nodes than the
  existing graph (use after deleting/refactoring large chunks of code).

.EXAMPLE
  .\graphify-refresh.ps1
  .\graphify-refresh.ps1 -Force
#>
param(
    [switch]$Force
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

if (-not (Test-Path "graphify-out\.graphify_python")) {
    Write-Error "graphify-out\.graphify_python not found. Run the initial /graphify setup first."
    exit 1
}

$py = Get-Content "graphify-out\.graphify_python" -Raw

$argsList = @("-m", "graphify", "update", ".")
if ($Force) { $argsList += "--force" }

& $py @argsList
