# Create a bootable EFI disk image for EK-OS
# This creates a VHD with FAT32 EFI System Partition

$VhdPath = "D:\work\autobusi-punjaci\ek-os\ek-os.vhd"
$VhdSize = 64MB
$EfiSource = "D:\work\autobusi-punjaci\ek-os\esp"

# Remove existing VHD if present
if (Test-Path $VhdPath) {
    Remove-Item $VhdPath -Force
}

# Create and mount VHD
$vhd = New-VHD -Path $VhdPath -SizeBytes $VhdSize -Fixed
Mount-VHD -Path $VhdPath

# Get the disk number
$disk = Get-VHD -Path $VhdPath | Get-Disk
$diskNumber = $disk.Number

# Initialize as GPT
Initialize-Disk -Number $diskNumber -PartitionStyle GPT

# Create EFI System Partition
$partition = New-Partition -DiskNumber $diskNumber -UseMaximumSize -GptType '{c12a7328-f81f-11d2-ba4b-00a0c93ec93b}'

# Format as FAT32
$volume = Format-Volume -Partition $partition -FileSystem FAT32 -NewFileSystemLabel "EFI"

# Assign drive letter temporarily
$partition | Add-PartitionAccessPath -AssignDriveLetter
$driveLetter = ($partition | Get-Partition).DriveLetter

Write-Host "Mounted at drive $driveLetter`:"

# Create EFI directory structure and copy files
$efiBootPath = "${driveLetter}:\EFI\BOOT"
New-Item -Path $efiBootPath -ItemType Directory -Force

Copy-Item "$EfiSource\EFI\BOOT\BOOTX64.EFI" -Destination $efiBootPath

Write-Host "Copied BOOTX64.EFI to $efiBootPath"

# List contents
Get-ChildItem "${driveLetter}:\" -Recurse

# Dismount
Dismount-VHD -Path $VhdPath

Write-Host "VHD created at $VhdPath"
