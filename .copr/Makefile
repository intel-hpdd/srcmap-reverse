BUILDROOT:=$(shell [ -d "/build" ] && echo "/build" || echo ".")
TMPDIR:=$(shell mktemp -d)

 srpm:
	yum install -y epel-release
	yum install -y npm rpm-build
	yum install -y nodejs-packaging
	rm -rf ${TMPDIR}/_topdir
	rm -rf ${TMPDIR}/scratch
	mkdir -p ${TMPDIR}/_topdir/SOURCES
	mkdir -p ${TMPDIR}/scratch
	cp -r ${BUILDROOT}/source ${BUILDROOT}/.babelrc ${BUILDROOT}/iml-srcmap-reverse.service ${BUILDROOT}/iml-srcmap-reverse.socket ${BUILDROOT}/*.json ${BUILDROOT}/*.js ${BUILDROOT}/srcmap-reverse.spec ${TMPDIR}/scratch
	source ~/.bash_profile && cd ${TMPDIR}/scratch && npm i && npm run postversion && npm pack
	mv -f ${TMPDIR}/scratch/iml-srcmap-reverse*.tgz ${TMPDIR}/_topdir/SOURCES/
	mv -f ${TMPDIR}/scratch/iml-srcmap-reverse.service ${TMPDIR}/_topdir/SOURCES
	mv -f ${TMPDIR}/scratch/iml-srcmap-reverse.socket ${TMPDIR}/_topdir/SOURCES
	rpmbuild -bs --define "_topdir ${TMPDIR}/_topdir" ${TMPDIR}/scratch/srcmap-reverse.spec
	cp -r ${TMPDIR}/_topdir/SRPMS/* $(outdir)