import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm, Field, Form, clearSubmitErrors, reset, submit } from 'redux-form';
import { DIALOG } from 'constants';
import { Modal, Button, message } from 'antd';
import { paginationSetting } from 'utils';
// import { connect } from 'react-redux';
import { renderTextField } from '../shared/form';


const required = value => (value ? undefined : '不能为空！');

@reduxForm({form: DIALOG.COURSE_DIRECTION})
class CourseDirectionDialog extends Component {
    static dialogName = DIALOG.COURSE_DIRECTION;

    state = {
        rows: 3
    }

    closeDialog = () => {
        this.props.dispatch(clearSubmitErrors(DIALOG.COURSE_DIRECTION));
        this.props.dispatch(reset(DIALOG.COURSE_DIRECTION));
        this.props.hideDialog(DIALOG.COURSE_DIRECTION)();
    }

    submit= (values) => {
        const {createCourseDirection, getCourseDirectionList} = this.props.actions;
        const params = {
            direction: values.direction
        };
        if (values.subDirections_0) {
            params.subDirections = Object.keys(values).map((key) => {
                if (key !== 'direction') {
                    return {
                        direction: values[key]
                    };
                }
                return '';
            }).filter(Boolean);
        }
        createCourseDirection(params)
            .then(() => {
                getCourseDirectionList({pageSize: paginationSetting.pageSize, parentId: 0}).then(() => {
                    message.success('创建成功');
                    this.closeDialog();
                });
            })
            .catch(error => {
                message.success('创建失败');
            });
    }

    renderSecondItem = () => {
        const {rows} = this.state;
        const result = [];
        for (let i = 0; i < rows; i++) { //eslint-disable-line
            result.push(
                <Field
                    labelClassName="col-md-3"
                    className="col-md-8"
                    rowClassName="dialogContainer__inputRow"
                    name={`subDirections_${i}`}
                    component={renderTextField}
                    type="text"
                    placeholder="二级种类名称"
                    label="对应二级种类名称"
                />
            );
        }
        return result;
    }

    addRow = () => {
        const {rows} = this.state;
        this.setState({rows: rows + 1});
    }

    render() {
        const {submitting, handleSubmit, visible, width, error, dispatch} = this.props;
        return (
            <Modal
                visible={visible}
                width={width}
                title="新增"
                onCancel={this.closeDialog}
                footer={[
                    <Button key="submit" onClick={() => dispatch(submit(DIALOG.COURSE_DIRECTION))} loading={submitting} type="primary">保存</Button>,
                    <Button key="back" onClick={this.closeDialog}>取消</Button>
                ]}
            >
                <Form onSubmit={handleSubmit(this.submit)}>
                    {error && <div className="dialogContainer--error"><strong >{error}</strong></div>}

                    <div className="dialogContainer">
                        <Field
                            labelClassName="col-md-3"
                            className="col-md-8"
                            rowClassName="dialogContainer__inputRow"
                            name="direction"
                            component={renderTextField}
                            type="text"
                            placeholder="一级种类名称"
                            label="一级种类名称"
                            validate={required}
                        />

                        {this.renderSecondItem()}

                        <div className="row dialogContainer__inputRow">
                            <div className="offset-md-3 col-md-8 u-text-right">
                                <Button type="primary" onClick={this.addRow}>继续添加</Button>
                            </div>
                        </div>


                    </div>
                </Form>
            </Modal>
        );
    }
}

CourseDirectionDialog.propTypes = {
    hideDialog: PropTypes.func,
    handleSubmit: PropTypes.func,
    visible: PropTypes.bool,
    submitting: PropTypes.bool,
    actions: PropTypes.objectOf(PropTypes.func),
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    dispatch: PropTypes.func,
    error: PropTypes.oneOfType([PropTypes.bool, PropTypes.string])
};

export default CourseDirectionDialog;
