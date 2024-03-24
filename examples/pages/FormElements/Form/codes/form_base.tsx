export default `const form1 = useForm({
    data: {
        u: 'fsdf',
        p: ''
    },
    validation: {
    },
    message: {
    }
});

<Form form={form1} inline>
    <FormItem name='u' label="用户名：">
        <Input type='text'/>
    </FormItem>
    <FormItem name='p' label="密码：">
        <Input type='password'/>
    </FormItem>
</Form>`;
