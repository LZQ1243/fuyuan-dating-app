import { View, Text, Input, Button, Picker, Image } from '@tarojs/components'
import React, { useState } from 'react'
import Taro, { showToast } from '@tarojs/taro'
import { submitVerification } from '@/services/user'
import './verification.scss'

export default function Verification() {
  const [form, setForm] = useState({
    realName: '',
    idCard: '',
    idCardFront: '',
    idCardBack: '',
    disabilityType: '',
    disabilityLevel: '',
    disabilityCertificate: ''
  })
  const [isDisabled, setIsDisabled] = useState(false)
  const [loading, setLoading] = useState(false)

  const disabilityTypes = [
    '视力残疾',
    '听力残疾',
    '言语残疾',
    '肢体残疾',
    '智利残疾',
    '精神残疾',
    '多重残疾'
  ]

  const disabilityLevels = ['一级', '二级', '三级', '四级']

  const handleChooseIdCardFront = async () => {
    try {
      const res = await Taro.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      })

      if (res.tempFilePaths) {
        setForm({ ...form, idCardFront: res.tempFilePaths[0] })
      }
    } catch (error) {
      console.error('选择身份证正面失败:', error)
    }
  }

  const handleChooseIdCardBack = async () => {
    try {
      const res = await Taro.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      })

      if (res.tempFilePaths) {
        setForm({ ...form, idCardBack: res.tempFilePaths[0] })
      }
    } catch (error) {
      console.error('选择身份证反面失败:', error)
    }
  }

  const handleChooseCertificate = async () => {
    try {
      const res = await Taro.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      })

      if (res.tempFilePaths) {
        setForm({ ...form, disabilityCertificate: res.tempFilePaths[0] })
      }
    } catch (error) {
      console.error('选择残疾证失败:', error)
    }
  }

  const handleInput = (field, value) => {
    setForm({ ...form, [field]: value })
  }

  const handleToggleDisabled = () => {
    setIsDisabled(!isDisabled)
    // 如果取消选择残疾相关字段
    if (!isDisabled) {
      setForm({
        ...form,
        disabilityType: '',
        disabilityLevel: '',
        disabilityCertificate: ''
      })
    }
  }

  const handleSubmit = async () => {
    // 表单验证
    if (!form.realName) {
      showToast({ title: '请输入真实姓名', icon: 'none' })
      return
    }

    if (!form.idCard || form.idCard.length !== 18) {
      showToast({ title: '请输入正确的身份证号', icon: 'none' })
      return
    }

    if (!form.idCardFront) {
      showToast({ title: '请上传身份证正面', icon: 'none' })
      return
    }

    if (!form.idCardBack) {
      showToast({ title: '请上传身份证反面', icon: 'none' })
      return
    }

    if (!isDisabled) {
      if (!form.disabilityType) {
        showToast({ title: '请选择残疾类型', icon: 'none' })
        return
      }
      if (!form.disabilityLevel) {
        showToast({ title: '请选择残疾等级', icon: 'none' })
        return
      }
      if (!form.disabilityCertificate) {
        showToast({ title: '请上传残疾证', icon: 'none' })
        return
      }
    }

    try {
      setLoading(true)

      // 上传身份证正面
      const idCardFrontUrl = form.idCardFront.startsWith('http')
        ? form.idCardFront
        : await uploadVerificationImages('id_card_front', form.idCardFront)

      // 上传身份证反面
      const idCardBackUrl = form.idCardBack.startsWith('http')
        ? form.idCardBack
        : await uploadVerificationImages('id_card_back', form.idCardBack)

      // 上传残疾证
      let disabilityCertificateUrl = ''
      if (form.disabilityCertificate) {
        disabilityCertificateUrl = form.disabilityCertificate.startsWith('http')
          ? form.disabilityCertificate
          : await uploadVerificationImages('disability_card', form.disabilityCertificate)
      }

      const formData = {
        realName: form.realName,
        idCard: form.idCard,
        idCardFrontUrl,
        idCardBackUrl,
        disabilityType: form.disabilityType,
        disabilityLevel: form.disabilityLevel,
        disabilityCertificateUrl
      }

      await submitVerification(formData)

      showToast({ title: '提交成功,请等待审核', icon: 'success' })

      setTimeout(() => {
        Taro.navigateBack()
      }, 2000)
    } catch (error) {
      console.error('提交失败:', error)
      showToast({ title: '提交失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const renderImageUpload = (label, value, onChoose) => (
    <View className='image-upload'>
      <Text className='upload-label'>{label}</Text>
      <View
        className={`upload-box ${value ? 'uploaded' : ''}`}
        onClick={onChoose}
      >
        {value ? (
          <Image
            className='upload-image'
            src={value}
            mode='aspectFill'
          />
        ) : (
          <View className='upload-placeholder'>
            <Text className='upload-icon'>+</Text>
          </View>
        )}
        {value && (
          <View
            className='delete-upload'
            onClick={(e) => {
              e.stopPropagation()
              handleUpload(label, '')
            }}
          >
            <Text className='delete-icon'>×</Text>
          </View>
        )}
      </View>
    </View>
  )

  const handleUpload = (field, value) => {
    if (field === 'idCardFront') {
      setForm({ ...form, idCardFront: value })
    } else if (field === 'idCardBack') {
      setForm({ ...form, idCardBack: value })
    } else if (field === 'disabilityCertificate') {
      setForm({ ...form, disabilityCertificate: value })
    }
  }

  return (
    <View className='verification-page'>
      <View className='header'>
        <Text className='title'>实名认证</Text>
      </View>

      <ScrollView scrollY className='form-container'>
        {/* 基本信息 */}
        <View className='form-section'>
          <Text className='section-title'>基本信息</Text>

          <View className='form-item'>
            <Text className='label'>真实姓名</Text>
            <Input
              className='input'
              value={form.realName}
              onInput={(e) => handleInput('realName', e.detail.value)}
              placeholder='请输入真实姓名'
            />
          </View>

          <View className='form-item'>
            <Text className='label'>身份证号</Text>
            <Input
              className='input'
              type='idcard'
              value={form.idCard}
              onInput={(e) => handleInput('idCard', e.detail.value)}
              placeholder='请输入18位身份证号'
              maxlength={18}
            />
          </View>
        </View>

        {/* 身份证上传 */}
        <View className='form-section'>
          <Text className='section-title'>身份证照片</Text>

          <View className='image-uploads'>
            {renderImageUpload('身份证正面', form.idCardFront, handleChooseIdCardFront)}
            {renderImageUpload('身份证反面', form.idCardBack, handleChooseIdCardBack)}
          </View>
        </View>

        {/* 残疾认证 */}
        <View className='form-section'>
          <View className='disability-header'>
            <Text className='section-title'>残疾认证</Text>
            <View
              className={`toggle-switch ${isDisabled ? 'disabled' : ''}`}
              onClick={handleToggleDisabled}
            >
              <Text className='toggle-text'>
                {isDisabled ? '否' : '是'}
              </Text>
              <Text className='toggle-label'>我是残疾人</Text>
            </View>
          </View>

          {!isDisabled && (
            <View className='disability-fields'>
              <View className='form-item'>
                <Text className='label'>残疾类型</Text>
                <Picker
                  mode='selector'
                  range={disabilityTypes}
                  value={disabilityTypes.indexOf(form.disabilityType)}
                  onChange={(e) => handleInput('disabilityType', disabilityTypes[e.detail.value])}
                >
                  <View className='picker'>
                    <Text className='picker-text'>
                      {form.disabilityType || '请选择残疾类型'}
                    </Text>
                    <Text className='picker-arrow'>›</Text>
                  </View>
                </Picker>
              </View>

              <View className='form-item'>
                <Text className='label'>残疾等级</Text>
                <Picker
                  mode='selector'
                  range={disabilityLevels}
                  value={disabilityLevels.indexOf(form.disabilityLevel)}
                  onChange={(e) => handleInput('disabilityLevel', disabilityLevels[e.detail.value])}
                >
                  <View className='picker'>
                    <Text className='picker-text'>
                      {form.disabilityLevel || '请选择残疾等级'}
                    </Text>
                    <Text className='picker-arrow'>›</Text>
                  </View>
                </Picker>
              </View>

              <View className='form-item'>
                <Text className='label'>残疾证</Text>
                {renderImageUpload('残疾证', form.disabilityCertificate, handleChooseCertificate)}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <View className='footer'>
        <View className='tips'>
          <Text className='tips-title'>注意事项:</Text>
          <Text className='tips-text'>1. 请确保照片清晰可见</Text>
          <Text className='tips-text'>2. 身份证号必须与身份证照片一致</Text>
          <Text className='tips-text'>3. 残疾认证为可选,非残疾人可以不填写</Text>
          <Text className='tips-text'>4. 认证通过后才能享受完整功能</Text>
        </View>
        <Button
          className='submit-btn'
          onClick={handleSubmit}
          loading={loading}
        >
          提交审核
        </Button>
      </View>
    </View>
  )
}
