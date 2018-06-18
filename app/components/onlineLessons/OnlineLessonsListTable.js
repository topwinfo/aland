import React, { Component } from 'react';
import { Table, Button, Popconfirm, message } from 'antd';
import PropTypes from 'prop-types';
import { DATE_FORMAT, getLinkByName, PATHNAME } from 'constants';
import { rebuildDataWithKey, paginationSetting } from 'utils';

class OnlineLessonsListTable extends Component {
    static propTypes = {
        // showDialog: PropTypes.func,
        actions: PropTypes.objectOf(PropTypes.func),
        dataSource: PropTypes.object,
        searchParams: PropTypes.object
    };

    constructor(props) {
        super(props);
        this.elements = [];
        this.pagination = {
            ...paginationSetting,
            onChange: this.handelPageChange
        };
        this.columns = [{
            title: '序号',
            align: 'center',
            dataIndex: 'index',
            width: 70
        }, {
            title: '课程名称',
            align: 'center',
            dataIndex: 'name'
        }, {
            title: '状态',
            align: 'center',
            dataIndex: 'status'
        }, {
            title: '课程讲师',
            align: 'center',
            dataIndex: 'lecturerName'
        }, {
            title: '保密权限',
            align: 'center',
            dataIndex: 'secretLevel'
        }, {
            title: '创建人',
            align: 'center',
            dataIndex: 'createUserName'
        }, {
            title: '发布时间',
            align: 'center',
            dataIndex: 'createdAt',
            render: (text, record) => moment(record.createdAt).format(DATE_FORMAT)
        }, {
            title: '操作',
            align: 'center',
            dataIndex: 'operation',
            render: (text, record) => (
                <div>
                    <Button size="small" type="primary" onClick={() => this.onEdit(record)} ghost>详情/编辑</Button>
                    {record.status === 'ISSUED' && <Button size="small" onClick={() => this.unShelveCourse(record)} type="primary" ghost>下架</Button>}
                    {record.status !== 'ISSUED' && <Button size="small" onClick={() => this.shelveCourse(record)} type="primary" ghost>上架</Button>}
                    <Popconfirm title="你确认要删除吗？" okText="确认" cancelText="取消" onConfirm={() => this.onDelete(record)}>
                        <Button size="small" type="primary" ghost>删除</Button>
                    </Popconfirm>
                </div>
            )
        }];
    }
    onEdit = (lesson) => {
        const {getCourseDetails, push} = this.props.actions;
        getCourseDetails(lesson.id)
            .then(() => {
                push(`${getLinkByName(PATHNAME.ONLINE_LESSONS)}/${lesson.id}/details`);
            })
            .catch(error => console.log(error));
    };

    onDelete = (lesson) => {
        const {
            dataSource: {paging: {size, page}},
            actions: {removeLesson, getOnlineLessonsList}
        } = this.props;
        removeLesson(lesson.id)
            .then(() => {
                message.success(`成功删除课程：${lesson.name}！`);
                getOnlineLessonsList(size, page);
            })
            .catch(error => {
                if (error?.errorCode === 'course_not_found') {
                    message.error(error?.errorMessage);
                } else {
                    message.error(`删除课程：${lesson.name}失败！`);
                }
            });
    }

    shelveCourse = (lesson) => {
        const {
            dataSource: {paging: {size, page}},
            actions: {shelveCourse, getOnlineLessonsList}
        } = this.props;
        shelveCourse(lesson.id)
            .then(() => {
                message.success(`成功上架课程：${lesson.name}！`);
                getOnlineLessonsList(size, page);
            })
            .catch(error => {
                if (error?.errorCode === 'course_not_found') {
                    message.error(error?.errorMessage);
                } else {
                    message.error(`上架课程：${lesson.name}失败！`);
                }
            });
    };

    unShelveCourse = (lesson) => {
        const {
            dataSource: {paging: {size, page}},
            actions: {unShelveCourse, getOnlineLessonsList}
        } = this.props;
        unShelveCourse(lesson.id)
            .then(() => {
                message.success(`成功下架课程：${lesson.name}！`);
                getOnlineLessonsList(size, page);
            })
            .catch(error => {
                if (error?.errorCode === 'course_not_found') {
                    message.error(error?.errorMessage);
                } else {
                    message.error(`下架课程：${lesson.name}失败！`);
                }
            });
    }

    handelPageChange = (page, pageSize) => {
        const { getOnlineLessonsList } = this.props.actions;
        const { searchParams } = this.props;
        getOnlineLessonsList(Object.assign({pageSize, page}, searchParams));
    }

    componentWillUpdate(nextProps) {
        if (nextProps.dataSource) {
            const { dataSource: {elements = [], paging = {}} } = nextProps;
            this.elements = rebuildDataWithKey(elements);
            const { size: pageSize = 0, total = 0 } = paging;
            this.pagination = {...this.pagination, pageSize, total};
        }
    }

    render() {
        return (
            <Table
                className="u-pull-down-sm"
                bordered
                size="middle"
                dataSource={this.elements}
                columns={this.columns}
                pagination={this.pagination}
            />
        );
    }
}

export default OnlineLessonsListTable;
