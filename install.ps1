Write-Output 'Install SendTo...'
$dirSendTo = [Environment]::GetFolderPath("SendTo");
$sendToInk = "$dirSendTo\FontLoaderSubWrapper.lnk";
if (!(Test-Path $sendToInk)) {
	$shortcut = (New-Object -COM WScript.Shell).CreateShortcut($sendToInk);
	$shortcut.TargetPath = "$PSScriptRoot\FontLoaderSubWrapper.bat";
	$shortcut.WorkingDirectory = "$PSScriptRoot";
	$shortcut.Save();
	Write-Output "Install `"$sendToInk`" success."
} else {
	Write-Output "Skip install SendTo: `"$sendToInk`" exists."
}

Write-Output 'Install Directory Background...'
$registryRoot = 'HKCU:\SOFTWARE\Classes\Directory\Background\shell\FontLoaderSubWrapper';
if (!(Test-Path $registryRoot)) {
	New-Item -Path $registryRoot -Value '載入字幕所需字型' -ItemType ExpandString -Force | Out-Null;
	New-Item -Path "$registryRoot\command" -Value "`"$PSScriptRoot\FontLoaderSubWrapper.bat`" `"%V`"" -ItemType ExpandString -Force | Out-Null;
	Write-Output "Install `"$registryRoot`" success."
} else {
	Write-Output "Skip install Directory Background: `"$registryRoot`" exists."
}
