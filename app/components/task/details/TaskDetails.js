import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm, Field, Form, getFormValues} from 'redux-form';
import { Button, Radio, message } from 'antd';
import uuid from 'uuid/v4';
import { renderOptions } from 'constants';
import { resetSpecificField } from 'utils';
import { connect } from 'react-redux';
import { renderTextField, renderQuill, renderRadioGroupField, renderCascaderField, renderSelectField, renderDateRangeField } from '../../shared/form';
import AutoSelectSearch from '../../shared/autoSearch/AutoSelectSearch';

const required = value => (value ? undefined : '不能为空！');

function mapStateToProps(state) {
    return {
        fieldValues: getFormValues('taskDetails')(state)
    };
}

@connect(mapStateToProps)
@reduxForm({form: 'taskDetails', enableReinitialize: true})
class TaskDetails extends Component {
    renderUserGroupOptions = () => {
        const {associations} = this.props;
        if (!associations?.userGroups) return;
        return renderOptions('id', 'name')(associations.userGroups);
    }


    submit = (values) => {
        const {actions: {createTask}} = this.props;

        const params = Object.keys(values).reduce((map, k) => {
            if (k === 'limitTime') {
                // map.startDate = moment(values[k][0]).format(DATE_FORMAT);
                map[k] = moment(values[k][1]).valueOf();
            } else if (k === 'manager') {
                map.managerId = values[k].key;
                map.manager = values[k].label;
            } else if (k === 'direction') {
                map.direction1 = values[k][0];
                map.direction2 = values[k][1];
            } else if (k === 'persons') {
                if (values.targetType === 'SPECIFIC') {
                    map.receivers = values[k].map(item => ({receiverId: item.key, receiverName: item.label}));
                }
            } else {
                map[k] = values[k];
            }
            return map;
        }, {});

        createTask(params)
            .then(() => {message.success(`保存学习任务${values.title}成功！`);})
            .catch(() => {message.success(`保存学习任务${values.title}失败！`);});
    }

    render() {
        const { submitting, handleSubmit, dispatch, tasks, fieldValues, associations} = this.props;
        console.log(tasks);
        const targetType = fieldValues?.targetType || '';
        const courseDirectionOptions = associations?.courseDirections || [];
        const restManagerValue = () => resetSpecificField(dispatch, 'taskDetails', 'manager', '');
        const restRangeDateTime = () => resetSpecificField(dispatch, 'taskDetails', 'limitTime', '');
        const restDirectionValue = () => resetSpecificField(dispatch, 'taskDetails', 'direction', '');
        const restUserGroup = () => resetSpecificField(dispatch, 'taskDetails', 'userGroupId', '');
        const resetPersonValue = () => resetSpecificField(dispatch, 'taskDetails', 'persons', '');
        return (
            <div>
                <Form name="form" onSubmit={handleSubmit(this.submit)}>
                    <Field
                        className="col-md-8 col-lg-6"
                        rowClassName="inputRow"
                        name="title"
                        component={renderTextField}
                        type="text"
                        placeholder="任务名称"
                        label="任务名称"
                        validate={required}
                    />

                    <Field
                        className="col-md-8 col-lg-6"
                        rowClassName="inputRow"
                        name="businessUnit"
                        component={renderTextField}
                        type="text"
                        placeholder="业务单元"
                        label="业务单元"
                    />

                    <Field
                        className="col-md-8 col-lg-6"
                        rowClassName="inputRow"
                        name="costCenter"
                        component={renderTextField}
                        type="text"
                        placeholder="成本中心"
                        label="成本中心"
                    />

                    <Field
                        className="col-md-8 col-lg-6"
                        rowClassName="inputRow"
                        name="isPlanOut"
                        defaultValue="1"
                        component={renderRadioGroupField}
                        label="计划外培训"
                    >
                        <Radio key={uuid()} value="1">是</Radio>
                        <Radio key={uuid()} value="0">否</Radio>
                    </Field>

                    <Field
                        className="col-md-8 col-lg-6"
                        rowClassName="inputRow"
                        name="trainType"
                        component={renderTextField}
                        type="text"
                        placeholder="培训种类"
                        label="培训种类"
                    />

                    <Field
                        className="col-md-8 col-lg-6"
                        rowClassName="inputRow"
                        layout="horizontal"
                        labelClassName="col-md-2 col-lg-1"
                        name="direction"
                        style={{alignItems: 'flex-start'}}
                        resetSelectValue={restDirectionValue}
                        component={renderCascaderField}
                        options={courseDirectionOptions}
                        placeholder="课程方向"
                        label="课程方向"
                    />

                    <Field
                        className="col-md-8 col-lg-6"
                        rowClassName="inputRow"
                        name="cost"
                        component={renderTextField}
                        type="text"
                        placeholder="0.00元"
                        label="培训费用"
                    />

                    <Field
                        className="col-md-8 col-lg-6"
                        rowClassName="inputRow"
                        name="totalTime"
                        component={renderTextField}
                        type="text"
                        placeholder="小时"
                        label="总课时"
                    />

                    <AutoSelectSearch
                        api="/api/users"
                        query="name"
                        resetSelectValue={restManagerValue}
                        className="col-md-8 col-lg-6"
                        rowClassName="inputRow"
                        name="manager"
                        placeholder="搜索负责人"
                        label="负责人"
                        renderOptions={renderOptions('id', 'name')}
                    />

                    <Field
                        className="col-md-8 col-lg-6"
                        rowClassName="inputRow"
                        name="limitTime"
                        allowClear={true}
                        resetSelectValue={restRangeDateTime}
                        component={renderDateRangeField}
                        label="完成期限"
                    />

                    <Field
                        className="col-md-8 col-lg-6"
                        rowClassName="inputRow"
                        name="targetType"
                        defaultValue="ALL"
                        component={renderRadioGroupField}
                        label="学习对象"
                    >
                        <Radio key={uuid()} value="ALL">全员</Radio>
                        <Radio key={uuid()} value="GROUP">学习群组</Radio>
                        <Radio key={uuid()} value="SPECIFIC">指定人员</Radio>
                    </Field>

                    {
                        targetType === 'GROUP' &&
                        <Field
                            className="col-md-8 col-lg-6"
                            rowClassName="inputRow"
                            name="userGroupId"
                            showSearch={true}
                            labelInValue={true}
                            allowClear={true}
                            filterOption={this.filterDept}
                            resetSelectValue={restUserGroup}
                            component={renderSelectField}
                            placeholder="学员群组"
                            label="学员群组"
                            validate={required}
                        >
                            {this.renderUserGroupOptions()}
                        </Field>
                    }

                    {
                        targetType === 'SPECIFIC' &&
                        <AutoSelectSearch
                            api="/api/users"
                            query="name"
                            mode="multiple"
                            resetSelectValue={resetPersonValue}
                            labelClassName="col-md-2 col-lg-1"
                            className="col-md-8 col-lg-6"
                            rowClassName="inputRow"
                            name="persons"
                            placeholder="搜索人员(可添加多个)"
                            label="人员"
                            validate={required}
                            renderOptions={renderOptions('id', 'name')}
                        />
                    }

                    <Field
                        className="col-md-10 col-lg-8"
                        rowClassName="inputRow"
                        name="addition"
                        label="任务补充"
                        onlyTextEditable={true}
                        component={renderQuill}
                    />

                    <div className="row inputRow">
                        <div className="col-md-8 col-lg-6 offset-md-2 offset-lg-1 u-text-right">
                            <Button htmlType="submit" loading={submitting} type="primary" className="editable-add-btn">保存</Button>
                        </div>
                    </div>
                </Form>
            </div>
        );
    }
}

TaskDetails.propTypes = {
    actions: PropTypes.objectOf(PropTypes.func),
    handleSubmit: PropTypes.func,
    dispatch: PropTypes.func,
    submitting: PropTypes.bool,
    tasks: PropTypes.object,
    fieldValues: PropTypes.object,
    associations: PropTypes.object
    // error: PropTypes.string,
};

export default TaskDetails;