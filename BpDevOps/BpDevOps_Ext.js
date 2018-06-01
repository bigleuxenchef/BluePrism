#!/usr/bin/env node
/**
 *  * Rumi 2018
 */

// Interested links :
//      https://www.microsoft.com/en-us/sql-server/developer-get-started/node/mac/
//      http://yargs.js.org/

const log4js = require('log4js')
const sql = require('mssql')
const formatxml = require('xml-formatter')
const fs = require('fs')

log4js.configure({
    appenders: { console: { type: 'console' }, BpDevOps_Ext: { type: 'file', filename: 'BpDevOps_Ext.log' } },
    categories: { default: { appenders: ['BpDevOps_Ext', 'console'], level: 'error' } }
});
var logger = log4js.getLogger('BpDevOps_Ext');
var mycommand = null //global variable containing the command to execute
var myoutput = (result => console.log(result))
var myrender = (result => { myoutput(JSON.stringify(result, null, 4)) }) //global variable containing the way to render the output
var filterpart = ''
var builtquery = ''

// Process Command line parameter

var argv = ProcessCommandlineParameters(require('yargs'));
logger.level = argv.loglevel


if (!mycommand) return // if no command submitted just quick

if (argv.File != null) // it the output is set to file, change the output function from console to file
    myoutput = (result => fs.appendFileSync(argv.File, result + "\n"))

logger.info("Argv", argv)

// configure Microsoft SQL Server parameters
const config = {
    user: argv.username,
    password: argv.password,
    server: argv.server, // You can use 'localhost\\instance' to connect to named instance
    port: argv.port, // optional, default value 1433
    database: argv.database,
    options: { encrypt: false }
}

// Core Engine
sqlconnection = sql.connect(config).then(() => {

    return mycommand(sql);
}
).then(result => {
    myrender(result);
    sql.close();

}).catch(err => {
    logger.info('Error on connect :', err);
})

// Methods : Extract and Render

function GetPackageList(sql) {

    return sql.query`select * from BPAPackage`
}
function RenderGetPackageListxml(result) {
    //TO DO
}

function RenderGetPackageListraw(result) {
    return result.recordset.reduce(function (temp, tuple) {
        return temp + tuple.name + '\n'
    }, '')
}



function GetProcessList(sql) {


    // snippet taken from https://social.msdn.microsoft.com/Forums/sqlserver/en-US/0c8e0c50-a695-4c7f-b032-7014c225ad11/passing-datepart-variable-to-dateadd?forum=transactsql
    return (!argv.A ? sql.query`select * from BPAProcess;` :
        sql.query`
           Declare @DatePart varchar(5), @UnitsToAdd int
           set @DatePart = ${argv.regex.groups.datepart}
           set @UnitsToAdd = ${argv.regex.groups.number}
           declare @cmd nvarchar(255), @Parms nvarchar(255), @dt datetime
           set @Parms = '@Units int, @dtOutput datetime OUTPUT'
           set @cmd = 'set @dtOutput = Dateadd(' + @DatePart + ',@Units, GETUTCDATE())'
           exec sp_ExecuteSQL @cmd, @parms,@Units = @UnitsToAdd, @dtOutput = @dt OUTPUT
           select distinct P.processid,P.ProcessType,P.name, P.description, P.version,format(P.lastmodifieddate,'yyyy-MM-dd HH:mm:ss.sss') as "lastmodifieddate", P.processxml
           from BPAProcess_devops P join  BPAAuditEvents A on P.processid=A.gTgtProcID 
            join (select processid, max(lastmodifieddate) as lastmodifieddate
                 from BPAProcess_devops
                 group by processid) f2
                 on P.processid = f2.processid and P.lastmodifieddate = f2.lastmodifieddate
           where eventdatetime > @dt`);
    // dateadd(hh,-4,eventdatetime) here the eventdatetime have been produced and render in Zulu time
}

function RenderGetProcessListraw(result) {
    return result.recordset.reduce(function (temp, tuple) {
        return temp + tuple.name + ';' + tuple.lastmodifieddate + '\n'
    }, '')
}

function GetProcessInRelease(sql, argv) {

    return sql.query`
        -- extract Process and object included in the release
        select typekey, RE.name as 'entityname',P.name as 'packagename',Pro.* from BPARelease R 
        join BPAPackage P on P.id = R.packageid 
        join BPAReleaseEntry RE on R.id = RE.releaseid
        join BPAProcess Pro on Pro.processid = RE.entityid
        where R.name = ${argv.releasename} and P.name = ${argv.packagename} and RE.typekey   in ('process','object')`

}

function RenderGetProcessInReleasexml(result) {
    // TO DO
}


function RenderGetProcessInReleaseraw(result) {
    return result.recordset.reduce(function (temp, tuple) {
        return temp + tuple.packagename + ';' + tuple.entityname + ';' + tuple.name + '\n'
    }, '')
}

function GetVariablesInRelease(sql, argv) {
    return sql.query`
    -- extract envrionment variable included in the release
    select typekey, RE.name as 'entityname',Env.* from BPARelease R 
    join BPAPackage P on P.id = R.packageid 
    join BPAReleaseEntry RE on R.id = RE.releaseid
    join BPAEnvironmentVar Env on Env.name = RE.entityid
    where R.name = ${argv.releasename} and P.name = ${argv.packagename} and RE.typekey   in ('environment-variable')`
}


function GetProcessXml(sql, argv) {
    return sql.query`
    select processxml
    from BPAProcess
    where name = ${argv.processname}`
}

function RenderGetProcessXmlxml(result) {
    return result.recordsets[0][0].processxml;
}
function RenderGetProcessXmlraw(result) {
    // TO DO 
}


function GetProcessDetails(sql, argv) {

    var result =
        sql.query`
    select *
    from BPAProcess
    where name = ${argv.processname}`

    return result;
}
function RenderGetProcessDetailsxml(result) {
    return result.recordsets[0].reduce(function (temp, tuple) {
        var objectorprocess = tuple.ProcessType == "O" ? "object" : "process";
        return temp + `
            <${objectorprocess} id="${tuple.processid}" name="${tuple.name}" published="true" xmlns="http://www.blueprism.co.uk/product/process">${tuple.processxml}</${objectorprocess}>`
    }, '')

}
function GetReleaseInfo(sql, argv) {
    return sql.query`
        select R.name as 'Releaseinfo', R.*, username, P.name as 'packagename'
            from BPARelease R join BPAUser U on R.userid = U.userid 
                join BPAPackage P on P.id = R.packageid
            where R.name = ${argv.releasename} and P.name = ${argv.packagename};`

}

function GetGroupReleaseInfo(sql, argv) {
    return sql.query`
    -- extract process/object group included in the release
    select typekey, RE.name as 'entityname',GP.groupid,GP.processid,GR.name from BPARelease R 
    inner join BPAPackage P on P.id = R.packageid 
    inner join BPAPackageProcess PP on PP.packageid = R.packageid
    inner join BPAReleaseEntry RE on R.id = RE.releaseid
    inner join BPAGroupProcess GP on GP.groupid = RE.entityid and GP.processid = PP.processid
    inner join BPAGroup GR on GR.id = RE.entityid
    where R.name = ${argv.releasename} and P.name = ${argv.packagename} and RE.typekey  in ('process-group','object-group')
    `

}

function GetReleaseDetails(sql, argv) {
    return GetReleaseInfo(sql, argv).then(result => {
        return GetProcessInRelease(sql, argv).then(result2 => {
            return GetVariablesInRelease(sql, argv).then(result3 => {
                return GetGroupReleaseInfo(sql, argv).then(result4 => {
                    result.recordsets.push(result2.recordsets[0])
                    result.recordsets.push(result3.recordsets[0])
                    result.recordsets.push(result4.recordsets[0])
                    return result

                })
            })
        }

        )
    }
    )
}

function RenderGetEnvironmentVarDetailsxml(result) {


    return result.recordsets[0].reduce(function (temp, tuple) {
        return temp +
            `
    <environment-variable id="${tuple.name}" name="${tuple.name}" type="${tuple.datatype}" value="${tuple.value}" xmlns="http://www.blueprism.co.uk/product/environment-variable">
        <description>${tuple.description}</description>
    </environment-variable>`
    }, '')
}

function RenderGetReleaseDetailsraw(result) { }

function RenderGetGroupDetailsxml(result) {

    var temp = "";
    var currentgroupid = null
    var objectorprocess = null

    for (i in result.recordsets[0]) {
        if (currentgroupid != result.recordsets[0][i].groupid) {
            currentgroupid = result.recordsets[0][i].groupid
            objectorprocess = result.recordsets[0][i].typekey == "object-group" ? "object" : "process";
            temp += (i > 0 ?
                `
            </members>  
        </${result.recordsets[0][i - 1].typekey}>` : '')
                +
                `
        <${result.recordsets[0][i].typekey} id="${result.recordsets[0][i].groupid}" name="${result.recordsets[0][i].name}" xmlns="http://www.blueprism.co.uk/product/process-group">
            <members>`
        }
        temp +=
            `
                <${objectorprocess} id= "${result.recordsets[0][i].processid}"/>`


    }
    if (result.recordsets[0].length > 0) // if the recordset is empty don't print anything
        temp += `
            </members>  
        </${result.recordsets[0][i].typekey}>`

    return temp;
}

function RenderGetReleaseDetailsxml(result) {

    var temp = `<?xml version="1.0" encoding="utf-8"?>
<bpr:release xmlns:bpr="http://www.blueprism.co.uk/product/release">
    <bpr:name>${result.recordset[0].Releaseinfo}</bpr:name>
    <bpr:release-notes>${result.recordset[0].notes}</bpr:release-notes>
    <bpr:created>${result.recordset[0].created}</bpr:created>
    <bpr:package-id>${result.recordset[0].packageid}</bpr:package-id>
    <bpr:package-name>${result.recordset[0].packagename}</bpr:package-name>
    <bpr:user-created-by>${result.recordset[0].username}</bpr:user-created-by>
    <bpr:contents count="4">`
    result.recordsets.shift() // first element is the release info.
    temp += RenderGetProcessDetailsxml(result)
    result.recordsets.shift()
    temp += RenderGetEnvironmentVarDetailsxml(result) +
        result.recordsets.shift()
    temp += RenderGetGroupDetailsxml(result) +
        `
    </bpr:contents>
</bpr:release>`
    return temp
}


function ProcessCommandlineParameters(argv) {

    return argv.option('s', {
        alias: 'server',
        demandOption: true,
        default: 'localhost',
        describe: 'Microsoft SQL Server name',
        type: 'string'
    })
        .option('u', {
            alias: 'username',
            demandOption: true,
            default: 'test',
            describe: 'SQL Server valid User Name',
            type: 'string'
        })
        .option('p', {
            alias: 'password',
            demandOption: true,
            default: 'changeme',
            describe: 'SQL Server valid User Password',
            type: 'string'
        })
        .option('P', {
            alias: 'port',
            demandOption: true,
            default: 1433,
            describe: 'SQL Server valid User Password',
            type: 'number'
        })
        .option('format', {
            alias: 'f',
            describe: 'output format',
            default: 'json',
            choices: ['raw', 'json', 'xml']
        })
        .option('database', {
            alias: 'D',
            describe: 'Blueprism database',
            default: 'BluePrismTraining'
        })
        .option('File', {
            alias: 'F',
            describe: 'output file',
            default: null
        }).option('loglevel', {
            alias: 'l',
            describe: 'Log4js Level OFF|FATAL|ERROR|WARN|INFO|DEBUG|TRACE|ALL',
            default: 'info'
        })

        .command('GetReleaseInfo', '-n|--name <release name> -N | --packagename <packagename> : Provide information about a specific release', function (yargs) {
            return yargs.option('n', {
                alias: 'releasename',
                describe: 'Name of the release in blueprism'
            }).option('N', {
                alias: 'packagename',
                describe: 'Name of the package'
            })
        },
            StandardBuilder)

        .command('GetProcessXml', '-n|--name <process name> : Provide the process in xml format', function (yargs) {
            return yargs.option('n', {
                alias: 'processname',
                describe: 'Provide the processname'
            })
        },
            StandardBuilder)
        .command('GetProcessDetails', '-n|--name <process name> : Provide the process in xml format', function (yargs) {
            return yargs.option('n', {
                alias: 'processname',
                describe: 'Provide the processname'
            })
        },
            StandardBuilder)
        .command('GetReleaseDetails', '-n|--releasename <process name> -N|--packagename : Provide the process in xml format', function (yargs) {
            return yargs.option('n', {
                alias: 'releasename',
                describe: 'Provide the release name'
            }).option('N', {
                alias: 'packagename',
                describe: 'Provide the package name'
            })
        },
            StandardBuilder)
        .command('GetPackageList', 'Provide the list of blueprism packages', {},
            StandardBuilder)
        .command('GetProcessList', '-A | -audit <number><date part> Provide the list of blueprism processes', function (yargs) {
            return yargs.option('A', {
                alias: 'audit',
                describe: 'Provide the list of processes modified, the processes in scope are the one following transact-SQL following query BPAAudit.eventdatetime > datedd(DATEADD(<date part>, <signed number>, getdate())',
                type: 'string'
            }).example("GetProcessList", "./BpDevOps_Ext.js GetProcessList -A -90mi\n./BpDevOps_Ext.js GetProcessList -f raw -A -90mi -F output.txt")
        },
            function (argv) {
                var regex1 = RegExp('(?<number>-?[0-9]+)(?<datepart>(yy|qq|mm|dy|wk|dw|dd|hh|mi){1})$');
                logger.info(`validation ${argv.A} against regex ${regex1.test(argv.A)}`);
                logger.info(`exec ${argv.A} against regex ${JSON.stringify(regex1.exec(argv.A), null, 4)}`);
                if (regex1.test(argv.A)) argv.regex = regex1.exec(argv.A);
                StandardBuilder(argv)
            })
        .command('GetProcessInRelease', '-n | --name <package name> : Provide the list of process in a specific release <package name>', function (yargs) {
            return yargs.option('n', {
                alias: 'releasename',
                describe: 'Provide the release name'
            }).option('N', {
                alias: 'packagename',
                describe: 'Provide the package name'
            })
        },
            StandardBuilder)
        .command('GetGroupReleaseInfo', '-n | --name <package name> : Provide information about the groups in a specific release <package name>', function (yargs) {
            return yargs.option('n', {
                alias: 'releasename',
                describe: 'Provide the release name'
            }).option('N', {
                alias: 'packagename',
                describe: 'Provide the package name'
            })
        },
            StandardBuilder)


        .command('GetVariablesInRelease', '-n | --name <package name> : Provide the list of variables in a specific release <package name>', function (yargs) {
            return yargs.option('n', {
                alias: 'releasename',
                describe: 'Provide the release name'
            }).option('N', {
                alias: 'packagename',
                describe: 'Provide the package name'
            })
        },
            StandardBuilder)



        .exitProcess(true)
        .argv;
}



function StandardBuilder(argv) {
    mycommand = ((sql) => eval(argv._[0])(sql, argv));
    if (RegExp('^(xml|raw)$').test(argv.format))
        myrender = (result => myoutput(eval('Render' + argv._ + argv.format)(result)));
}
