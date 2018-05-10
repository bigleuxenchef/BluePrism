


file for login agent is in C:\ProgramData\Blue Prism Limited\Automate V3\LoginAgentService.config

Trouble shooting

Pending process

be careful that when leaving a bot unattended that no process remains in pending state after having been added manually. it will stopped the whole process

query tested

"select * from Win32_ComputerSystem"
"select * from Win32_Process"
"select * from Win32_ComputerSystem"

Win32_PerRawData
Win32_PerfFormattedData



select * from Win32_ComputerSystem
where Name = "MSSQL$EXPRESS"




installing metricbeat as a service on window
it needs to run in a cmd as of administrator
PowerShell.exe -ExecutionPolicy UnRestricted -File .\install-service-metricbeat.ps1




stage type 1024 is Start

interesting query for visualization

REcord seqnum 1 contain the root Process name
Record Stage type 1024 with BPASessionLog_NonUnicode.processname not null contain the sub processes run under the root process defined in seqnum 0

