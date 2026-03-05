#!/bin/bash

# install from pkg manager
yum install -y amazon-cloudwatch-agent
# or Download & Install by rpm
#wget https://s3.ap-northeast-1.amazonaws.com/amazoncloudwatch-agent-ap-northeast-1/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
#rpm -U ./amazon-cloudwatch-agent.rpm

# create config file
/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-config-wizard

# start agent
mkdir -p /usr/share/collectd
touch /usr/share/collectd/types.db
/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -s -c file:/opt/aws/amazon-cloudwatch-agent/bin/config.json
# or use config from SSM
# /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -s -c ssm:AmazonCloudWatch-linux


