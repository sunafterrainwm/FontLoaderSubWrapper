Write-Output 'Uninstall SendTo...'
$dirSendTo = [Environment]::GetFolderPath("SendTo");
$sendToInk = "$dirSendTo\FontLoaderSubWrapper.lnk";
if (Test-Path $sendToInk) {
	Remove-Item $sendToInk -Force;
	Write-Output "Uninstall `"$sendToInk`" success."
} else {
	Write-Output "Skip uninstall SendTo: `"$sendToInk`" isn't exist."
}

Write-Output 'Uninstall Directory Background...'
$registryRoot = 'HKCU:\SOFTWARE\Classes\Directory\Background\shell\FontLoaderSubWrapper';
if (Test-Path $registryRoot) {
	Remove-Item $registryRoot -Recurse -Force;
	Write-Output "Uninstall `"$registryRoot`" success."
} else {
	Write-Output "Skip uninstall Directory Background: `"$registryRoot`" isn't exist."
}
