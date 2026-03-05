#!/bin/bash

# define environment vars here
export MY_CLOUDWATCH_LOG_GROUP=okmen4

yum update -y

# install apache server
yum install -y httpd
systemctl start httpd
systemctl enable httpd

# set up simple static and dynamic API at /index.html and /now
echo "<h1>Hello World from $(hostname -f)</h1>" > /var/www/html/index.html
while true; do date > /var/www/html/now; sleep 1s; done &

# install cw log agent
yum install -y amazon-cloudwatch-agent

# create config file
cat << EOF > /opt/aws/amazon-cloudwatch-agent/bin/config.json
{
	"agent": {
		"metrics_collection_interval": 60,
		"run_as_user": "root"
	},
	"logs": {
		"logs_collected": {
			"files": {
				"collect_list": [
					{
						"file_path": "/var/log/httpd/access_log",
						"log_group_class": "STANDARD",
						"log_group_name": "${MY_CLOUDWATCH_LOG_GROUP}-access_log",
						"log_stream_name": "{instance_id}",
						"retention_in_days": 3
					},
					{
						"file_path": "/var/log/httpd/error_log",
						"log_group_class": "STANDARD",
						"log_group_name": "${MY_CLOUDWATCH_LOG_GROUP}-error_log",
						"log_stream_name": "{instance_id}",
						"retention_in_days": 3
					}
				]
			}
		}
	},
	"metrics": {
		"aggregation_dimensions": [
			[
				"InstanceId"
			]
		],
		"append_dimensions": {
			"AutoScalingGroupName": "\${aws:AutoScalingGroupName}",
			"ImageId": "\${aws:ImageId}",
			"InstanceId": "\${aws:InstanceId}",
			"InstanceType": "\${aws:InstanceType}"
		},
		"metrics_collected": {
			"collectd": {
				"metrics_aggregation_interval": 60
			},
			"disk": {
				"measurement": [
					"used_percent"
				],
				"metrics_collection_interval": 60,
				"resources": [
					"*"
				]
			},
			"mem": {
				"measurement": [
					"mem_used_percent"
				],
				"metrics_collection_interval": 60
			},
			"statsd": {
				"metrics_aggregation_interval": 60,
				"metrics_collection_interval": 10,
				"service_address": ":8125"
			}
		}
	}
}
EOF

# start agent
mkdir -p /usr/share/collectd
touch /usr/share/collectd/types.db
/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -s -c file:/opt/aws/amazon-cloudwatch-agent/bin/config.json