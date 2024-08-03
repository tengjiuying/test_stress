#!/usr/bin/env bash
export jmx_template="/Users/tengfeng/apache-jmeter-5.6.3/bin/order_service/order_service"
export suffix=".jmx"
export jmx_template_filename="${jmx_template}${suffix}"
export os_type=`uname`

# 需要在系统变量中定义jmeter根目录的位置，如下
export jmeter_path=/Users/tengfeng/apache-jmeter-5.6.3

echo "清空nohup.out"
cat /dev/null > nohup.out

echo "强制杀掉JMeter进程"
killJMeter()
{
    pid=`ps -ef|grep jmeter|grep java|grep ${jmx_filename}|awk '{print $2}'`
    echo "jmeter Id list :$pid"
    if [[ "$pid" = "" ]]
    then
      echo "no jmeter pid alive"
    else
      kill -9 $pid
    fi
}

echo "自动化压测全部开始"
#压测并发数列表
thread_number_array=(130 140)
for num in "${thread_number_array[@]}"
do
    # 生成对应压测线程的jmx文件
    export jmx_filename="${jmx_template}_${num}${suffix}"
    export jtl_filename="test_${num}.jtl"
    export web_report_path_name="web_${num}"

    rm -f ${jmx_filename} ${jtl_filename}
    rm -rf ${web_report_path_name}

    cp ${jmx_template_filename} ${jmx_filename}
    echo "生成jmx压测脚本 ${jmx_filename}"

    if [[ "${os_type}" == "Darwin" ]]; then
        sed -i "" "s/thread_num/${num}/g" ${jmx_filename}
    else
        sed -i "s/thread_num/${num}/g" ${jmx_filename}
    fi

    # JMeter 静默压测,生成web压测报告
    ${jmeter_path}/bin/jmeter -n -t ${jmx_filename} -l ${jtl_filename} -e -o ${web_report_path_name}


    sleep 60
    killJMeter
done
echo "自动化压测全部结束"