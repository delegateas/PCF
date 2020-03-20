param([string]$number = '0')
$newVersion = '1.' + $number
$newSolVersion = '<Version>' + $newVersion + '</Version>'
Get-ChildItem *.Input.xml -Recurse | Foreach-Object { (Get-Content $_) -replace '0.0.0', $newVersion | Set-Content $_ }
Get-ChildItem *Solution.xml -Recurse | Foreach-Object { (Get-Content $_) -replace '<Version>1.0</Version>', $newSolVersion | Set-Content $_ }
